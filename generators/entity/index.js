const util = require('util');
const chalk = require('chalk');
const glob = require('glob');
const generator = require('yeoman-generator');
const packagejs = require(`${__dirname}/../../package.json`);
const semver = require('semver');
const BaseGenerator = require('../common');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const _s = require('underscore.string');
const fs = require('fs');

const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

module.exports = JhipsterGenerator.extend({
    initializing: {
        readConfig() {
            this.jhipsterAppConfig = this.getJhipsterAppConfig();
            if (!this.jhipsterAppConfig) {
                this.error('Can\'t read .yo-rc.json');
            }
            this.entityConfig = this.options.entityConfig;
        },
        displayLogo() {
            this.log(chalk.white(`Running ${chalk.bold('JHipster postgresuuid-converter')} Generator! ${chalk.yellow(`v${packagejs.version}\n`)}`));
        },
        validate() {
            // this shouldn't be run directly
            if (!this.entityConfig) {
                this.env.error(`${chalk.red.bold('ERROR!')} This sub generator should be used only from JHipster and cannot be run directly...\n`);
            }
        }
    },

    prompting() {
        // don't prompt if data are imported from a file
        if (this.entityConfig.useConfigurationFile == true && this.entityConfig.data && typeof this.entityConfig.data.yourOptionKey !== 'undefined') {
            this.yourOptionKey = this.entityConfig.data.yourOptionKey;
            return;
        }
        const done = this.async();
        const prompts = [];

        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    },

    writing: {
        updateFiles() {
            // read config from .yo-rc.json
            this.baseName = this.jhipsterAppConfig.baseName;
            this.packageName = this.jhipsterAppConfig.packageName;
            this.packageFolder = this.jhipsterAppConfig.packageFolder;
            this.clientFramework = this.jhipsterAppConfig.clientFramework;
            this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
            this.buildTool = this.jhipsterAppConfig.buildTool;

            // use function in generator-base.js from generator-jhipster
            // this.angularAppName = this.getAngularAppName();

            // use constants from generator-constants.js
            const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
            const javaTestDir = `${jhipsterConstants.SERVER_TEST_SRC_DIR + this.packageFolder}/`;
            // const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
            // const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

            const entityName = this.entityConfig.entityClass;

            // do your stuff here
            // check if repositories are already annotated
            const uuidGeneratorAnnotation = '@GeneratedValue.*"UUIDGenerator"';
            const pattern = new RegExp(uuidGeneratorAnnotation, 'g');

            const content = this.fs.read(`${javaDir}domain/${entityName}.java`, 'utf8');

            if (!pattern.test(content)) {
                // We need to convert this entity

                // JAVA
                this.convertIDtoUUIDForColumn(`${javaDir}domain/${entityName}.java`, 'import java.util.Objects;', 'id');

                // DTO
                if (fs.existsSync(`${javaDir}service/dto/${entityName}DTO.java`)) {
                    this.importUUID(`${javaDir}service/dto/${entityName}DTO.java`, 'import java.util.Objects;');
                    this.longToUUID(`${javaDir}service/dto/${entityName}DTO.java`);
                }

                // Mapper
                if (fs.existsSync(`${javaDir}service/mapper/${entityName}Mapper.java`)) {
                    this.importUUID(`${javaDir}service/mapper/${entityName}Mapper.java`, 'import org.mapstruct.*;');
                    this.longToUUID(`${javaDir}service/mapper/${entityName}Mapper.java`);
                }

                // And the Repository
                this.importUUID(`${javaDir}repository/${entityName}Repository.java`, 'import org.springframework.data.jpa.repository.*;');
                this.longToUUID(`${javaDir}repository/${entityName}Repository.java`);

                // The Search Repository
                if (fs.existsSync(`${javaDir}repository/search/${entityName}SearchRepository.java`)) {
                    this.importUUID(`${javaDir}repository/search/${entityName}SearchRepository.java`, 'import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;');
                    this.longToUUID(`${javaDir}repository/search/${entityName}SearchRepository.java`);
                }

                // Service
                if (fs.existsSync(`${javaDir}service/${entityName}Service.java`)) {
                    this.importUUID(`${javaDir}service/${entityName}Service.java`, 'import org.slf4j.LoggerFactory;');
                    this.longToUUID(`${javaDir}service/${entityName}Service.java`);
                }

                // ServiceImp
                if (fs.existsSync(`${javaDir}service/impl/${entityName}ServiceImpl.java`)) {
                    this.importUUID(`${javaDir}service/impl/${entityName}ServiceImpl.java`, 'import org.slf4j.LoggerFactory;');
                    this.longToUUID(`${javaDir}service/impl/${entityName}ServiceImpl.java`);
                }

                // Resource
                this.importUUID(`${javaDir}web/rest/${entityName}Resource.java`);
                this.longToUUID(`${javaDir}web/rest/${entityName}Resource.java`);

                // JavaScript
                const entityNameSpinalCased = _s.dasherize(_s.decapitalize(entityName));
                const stateFile = glob.sync(`${this.webappDir}../webapp/app/entities/${entityNameSpinalCased}/${entityNameSpinalCased}*.state.js`)[0];
                this.replaceContent(stateFile, '\{id\:int\}', '{id:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}}', true);

                // Liquidbase
                const file = glob.sync(`src/main/resources/config/liquibase/changelog/*entity_${entityName}.xml`)[0];
                this.replaceContent(file, 'type="bigint"', 'type="uuid"', true);
                this.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);

                // Test
                // Handle the question of life check
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, '(42L|42)', 'UUID.fromString("00000000-0000-0000-0000-000000000042")', true);
                this.importUUID(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, 'import java.util.List;');
                this.longToUUID(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`);
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, '1L', 'UUID.fromString("00000000-0000-0000-0000-000000000001")', true);
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, '2L', 'UUID.fromString("00000000-0000-0000-0000-000000000002")', true);
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, 'getId\\(\\)\\.intValue\\(\\)', 'getId().toString()', true);
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, '\\.intValue\\(\\)', '.toString()', true);
                this.replaceContent(`${javaTestDir}/web/rest/${entityName}ResourceIntTest.java`, 'MAX_VALUE', 'randomUUID()', true);
            }
        },

        writeFiles() {
            // function to use directly template
            this.template = function (source, destination) {
                fs.copyTpl(
                    this.templatePath(source),
                    this.destinationPath(destination),
                    this
                );
            };
        },

        updateConfig() {
            this.updateEntityConfig(this.entityConfig.filename, 'yourOptionKey', this.yourOptionKey);
        }
    },

    end() {
        if (this.yourOptionKey) {
            this.log(`\n${chalk.bold.green('postgresuuid-converter enabled')}`);
        }
    }
});
