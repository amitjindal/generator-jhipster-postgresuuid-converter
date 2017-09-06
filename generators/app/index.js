const util = require('util');
const chalk = require('chalk');
const glob = require('glob');
const generator = require('yeoman-generator');
const packagejs = require('../../package.json');
const semver = require('semver');
const BaseGenerator = require('../common');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const JhipsterGenerator = generator.extend({});
util.inherits(JhipsterGenerator, BaseGenerator);

module.exports = JhipsterGenerator.extend({
    initializing: {
        readConfig() {
            this.jhipsterAppConfig = this.getJhipsterAppConfig();
            if (!this.jhipsterAppConfig) {
                this.error('Can\'t read .yo-rc.json');
            }
        },
        displayLogo() {
            // it's here to show that you can use functions from generator-jhipster
            // this function is in: generator-jhipster/generators/generator-base.js
            this.printJHipsterLogo();

            // Have Yeoman greet the user.
            this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster postgresuuid-converter')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
        },
        checkJhipster() {
            const jhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
            const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
            if (!semver.satisfies(jhipsterVersion, minimumJhipsterVersion)) {
                this.warning(`\nYour generated project used an old JHipster version (${jhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`);
            }
        }
    },

    prompting() {
        const prompts = [];
        const done = this.async();
        this.prompt(prompts).then((props) => {
            this.props = props;
            // To access props later use this.props.someOption;

            done();
        });
    },

    writing() {
        // function to use directly template
        this.template = function (source, destination) {
            this.fs.copyTpl(
                this.templatePath(source),
                this.destinationPath(destination),
                this
            );
        };

        // function to check if this generator has already run or not.
        this.isFirstRun = function () {
            return true;
        };

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

        // variable from questions
        this.message = this.props.message;

        // show all variables
        // this.log('\n--- some config read from config ---');
        // this.log(`baseName=${this.baseName}`);
        // this.log(`packageName=${this.packageName}`);
        // this.log(`clientFramework=${this.clientFramework}`);
        // this.log(`clientPackageManager=${this.clientPackageManager}`);
        // this.log(`buildTool=${this.buildTool}`);
        //
        // this.log('\n--- some function ---');
        // this.log(`angularAppName=${this.angularAppName}`);
        //
        // this.log('\n--- some const ---');
        // this.log(`javaDir=${javaDir}`);
        // this.log(`resourceDir=${resourceDir}`);
        // this.log(`webappDir=${webappDir}`);
        //
        // this.log('\n--- variables from questions ---');
        // this.log(`\nmessage=${this.message}`);
        // this.log('------\n');

        // Convert Code here
        this.convertIDtoUUIDForColumn(`${javaDir}domain/User.java`, 'import java.time.Instant;', 'id');

        this.convertIDtoUUIDForColumn(`${javaDir}domain/PersistentAuditEvent.java`, 'import java.util.Map;', 'event_id');
        this.importUUID(`${javaDir}domain/PersistentAuditEvent.java`, 'import java.util.Map;');
        // And the Repository
        this.replaceContent(`${javaDir}repository/UserRepository.java`, 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}repository/UserRepository.java`);

        this.replaceContent(`${javaDir}repository/PersistenceAuditEventRepository.java`, 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}repository/PersistenceAuditEventRepository.java`);

        this.replaceContent(`${javaDir}service/AuditEventService.java`, 'import java.util.Optional;', 'import java.util.Optional;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}service/AuditEventService.java`);

        this.replaceContent(`${javaDir}service/UserService.java`, 'getUserWithAuthorities(Long id)', 'getUserWithAuthorities(UUID id)');

        this.replaceContent(`${javaDir}web/rest/AuditResource.java`, 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        this.replaceContent(`${javaDir}web/rest/AuditResource.java`, 'get(@PathVariable Long id)', 'get(@PathVariable UUID id)');

        this.replaceContent(`${javaDir}service/mapper/UserMapper.java`, 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        this.replaceContent(`${javaDir}service/mapper/UserMapper.java`, 'userFromId(Long id)', 'userFromId(UUID id)');

        this.replaceContent(`${javaDir}web/rest/vm/ManagedUserVM.java`, 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}web/rest/vm/ManagedUserVM.java`);

        this.replaceContent(`${javaDir}service/dto/UserDTO.java`, 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}service/dto/UserDTO.java`);

        this.replaceContent(`${javaDir}service/mapper/UserMapper.java`, 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        this.longToUUID(`${javaDir}service/mapper/UserMapper.java`);

        this.longToUUID(`${javaDir}service/UserService.java`);

        // Tests
        this.longToUUID(`${javaTestDir}web/rest/UserResourceIntTest.java`);
        this.importUUID(`${javaTestDir}web/rest/UserResourceIntTest.java`, 'import java.util.List;');
        this.replaceContent(`${javaTestDir}web/rest/UserResourceIntTest.java`, '1L', 'UUID.fromString("00000000-0000-0000-0000-000000000001")', true);
        this.replaceContent(`${javaTestDir}web/rest/UserResourceIntTest.java`, '2L', 'UUID.fromString("00000000-0000-0000-0000-000000000002")', true);

        const file = glob.sync('src/main/resources/config/liquibase/changelog/*initial_schema.xml')[0];
        this.replaceContent(file, 'type="bigint"', 'type="uuid"', true);
        this.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);

        this.replaceContent('src/main/resources/config/liquibase/users.csv', '1;', '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;', true);
        this.replaceContent('src/main/resources/config/liquibase/users.csv', '2;', '8d9b7412-ddf4-11e5-b86d-9a79f06e9478;', true);
        this.replaceContent('src/main/resources/config/liquibase/users.csv', '3;', '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;', true);
        this.replaceContent('src/main/resources/config/liquibase/users.csv', '4;', '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;', true);

        this.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '1;', '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;', true);
        this.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '3;', '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;', true);
        this.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '4;', '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;', true);

        this.log(`${chalk.green.bold('SUCCESS!')} Update of core files complete...\n`);

        try {
            this.registerModule('generator-jhipster-postgresuuid-converter', 'entity', 'post', 'entity', 'Postgresql Long to UUID converter');
        } catch (err) {
            this.log(`${chalk.red.bold('WARN!')} Could not register as a jhipster entity post creation hook...\n`);
        }
    },

    install() {
        let logMsg =
            `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;

        if (this.clientFramework === 'angular1') {
            logMsg =
                `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install & bower install`)}`;
        }
        const injectDependenciesAndConstants = (err) => {
            if (err) {
                this.warning('Install of dependencies failed!');
                this.log(logMsg);
            } else if (this.clientFramework === 'angular1') {
                this.spawnCommand('gulp', ['install']);
            }
        };
        const installConfig = {
            bower: this.clientFramework === 'angular1',
            npm: this.clientPackageManager !== 'yarn',
            yarn: this.clientPackageManager === 'yarn',
            callback: injectDependenciesAndConstants
        };
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.installDependencies(installConfig);
        }
    },

    end() {
        this.log('End of postgresuuid-converter generator');
    }
});
