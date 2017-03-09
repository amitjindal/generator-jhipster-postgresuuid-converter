'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var packagejs = require(__dirname + '/../../package.json');

var path = require('path'),
  util = require('util'),
  _ = require('lodash'),
  _s = require('underscore.string'),
  fs = require('fs'),
  glob = require("glob");

// Stores JHipster variables
var jhipsterVar = {moduleName: 'postgresuuid-converter'};

// Stores JHipster functions
var jhipsterFunc = {};

var longToUUID = function(file) {
  jhipsterFunc.replaceContent(file, 'Long', 'UUID', true);
};

// TODO: Handle other types in entity properly. Not with brute force.
var convertIDtoUUIDwithCol = function(file, importNeedle, columnName) {
  jhipsterFunc.replaceContent(file, importNeedle, importNeedle + '\nimport java.util.UUID;\nimport org.hibernate.annotations.GenericGenerator;');
  jhipsterFunc.replaceContent(file, 'strategy = GenerationType.AUTO', 'generator = "UUIDGenerator"');
  jhipsterFunc.replaceContent(file, '@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")', '@GeneratedValue(strategy = GenerationType.AUTO, generator = "UUIDGenerator")');
  jhipsterFunc.replaceContent(file, '@SequenceGenerator(name = "sequenceGenerator")', '@GenericGenerator(name = "UUIDGenerator", strategy = "uuid2")');
  jhipsterFunc.replaceContent(file, '@Id', '@Id\n    @Column(name = "'+columnName+'", columnDefinition = "uuid")\n    @org.hibernate.annotations.Type(type="pg-uuid")');
  longToUUID(file);
};

var convertIDtoUUID = function(file, importNeedle) {
  convertIDtoUUIDwithCol(file, importNeedle, 'id');
};

module.exports = yeoman.Base.extend({

  initializing: {
    compose: function (args) {
      this.composeWith('jhipster:modules',
        {
          options: {
            jhipsterVar: jhipsterVar,
            jhipsterFunc: jhipsterFunc
          }
        },
        this.options.testmode ? {local: require.resolve('generator-jhipster/generators/modules')} : null
      );
    },
    displayLogo: function () {
      // Have Yeoman greet the user.
      this.log('Welcome to the ' + chalk.red('JHipster Aquevix Postgres to UUID Converter') + ' generator! ' + chalk.yellow('v' + packagejs.version + '\n'));
      this.log('Variables:');
      this.log(JSON.stringify(jhipsterVar));
    },
    checkDBType: function () {
      if (jhipsterVar.databaseType != 'sql' && jhipsterVar.prodDatabaseType != 'postgresql') {
        // exit if DB type is not Postgres
        this.abort = true;
      }
    },
    getEntitityNames: function () {
      var existingEntities = [],
        existingEntityChoices = [],
        existingEntityNames = [];
      try{
        if (fs.existsSync('.jhipster')) {
          existingEntityNames = fs.readdirSync('.jhipster');
        } else {
          this.log(chalk.yellow.bold('WARN') + ' Could not read entities, you might not have generated any entities yet. I will continue to update core files, entities will not be updated...\n');
        }
      } catch(e) {
        this.log(e);
        this.log(chalk.red.bold('ERROR!') + ' Could not read entities folder, you might not have generated any entities yet. I will continue to update core files, entities will not be updated...\n');
      }

      existingEntityNames.forEach(function(entry) {
        if(entry.indexOf('.json') !== -1){
          var entityName = entry.replace('.json','');
          existingEntities.push(entityName);
          existingEntityChoices.push({name: entityName, value: entityName});
        }
      });
      this.existingEntities = existingEntities;
      this.existingEntityChoices = existingEntityChoices;
      this.log(JSON.stringify(existingEntities));
    }
  },

  writing: {
    writeTemplates : function () {
    },
    setupGlobalVar : function () {
      this.baseName = jhipsterVar.baseName;
      this.packageName = jhipsterVar.packageName;
      this.packageFolder = jhipsterVar.packageFolder;
      this.angularAppName = jhipsterVar.angularAppName;
      this.frontendBuilder = jhipsterVar.frontendBuilder;
      this.buildTool = jhipsterVar.buildTool;
      this.databaseType = jhipsterVar.databaseType;
      this.changelogDate = jhipsterFunc.dateFormatForLiquibase();
      this.webappDir = jhipsterVar.webappDir;
      this.javaTemplateDir = 'src/main/java/package';
      this.javaDir = jhipsterVar.javaDir;
      this.resourceDir = jhipsterVar.resourceDir;
      this.interpolateRegex = /<%=([\s\S]+?)%>/g; // so that thymeleaf tags in templates do not get mistreated as _ templates
      this.copyFiles = function (files) {
        files.forEach( function(file) {
          jhipsterFunc.copyTemplate(file.from, file.to, file.type? file.type: TPL, this, file.interpolate? { 'interpolate': file.interpolate } : undefined);
        }, this);
      };
    },

    updateBaseFiles : function () {

      var uuidGeneratorAnnotation = '@GeneratedValue.*"UUIDGenerator"';
      var pattern = new RegExp(uuidGeneratorAnnotation, 'g');
      var content = this.fs.read(this.javaDir + 'domain/User.java', 'utf8');
      if (!pattern.test(content))
      {
        convertIDtoUUID(this.javaDir + 'domain/User.java', 'import java.time.ZonedDateTime;');

        jhipsterFunc.replaceContent(this.javaDir + 'domain/PersistentAuditEvent.java', '    @Column(name = "event_id")\n', '');
        convertIDtoUUIDwithCol(this.javaDir + 'domain/PersistentAuditEvent.java', 'import java.util.Map;', 'event_id');

        // And the Repository
        jhipsterFunc.replaceContent(this.javaDir + 'repository/UserRepository.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'repository/UserRepository.java');

        jhipsterFunc.replaceContent(this.javaDir + 'repository/PersistenceAuditEventRepository.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'repository/PersistenceAuditEventRepository.java');

        jhipsterFunc.replaceContent(this.javaDir + 'service/AuditEventService.java', 'import java.util.Optional;', 'import java.util.Optional;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'service/AuditEventService.java');

        jhipsterFunc.replaceContent(this.javaDir + 'service/UserService.java', 'getUserWithAuthorities(Long id)', 'getUserWithAuthorities(UUID id)');

        jhipsterFunc.replaceContent(this.javaDir + 'web/rest/AuditResource.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        jhipsterFunc.replaceContent(this.javaDir + 'web/rest/AuditResource.java', 'get(@PathVariable Long id)', 'get(@PathVariable UUID id)');

        jhipsterFunc.replaceContent(this.javaDir + 'service/mapper/UserMapper.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
        jhipsterFunc.replaceContent(this.javaDir + 'service/mapper/UserMapper.java', 'userFromId(Long id)', 'userFromId(UUID id)');

        jhipsterFunc.replaceContent(this.javaDir + 'web/rest/vm/ManagedUserVM.java', 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'web/rest/vm/ManagedUserVM.java');

        jhipsterFunc.replaceContent(this.javaDir + 'service/dto/UserDTO.java', 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'service/dto/UserDTO.java');

        jhipsterFunc.replaceContent(this.javaDir + 'service/mapper/UserMapper.java', 'import java.util.Set;', 'import java.util.Set;\nimport java.util.UUID;');
        longToUUID(this.javaDir + 'service/mapper/UserMapper.java');

        longToUUID(this.javaDir + 'service/UserService.java');

        var file = glob.sync("src/main/resources/config/liquibase/changelog/*initial_schema.xml")[0];
        jhipsterFunc.replaceContent(file, 'type="bigint"', 'type="uuid"',true);
        jhipsterFunc.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);

        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users.csv', '1;', '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;', true);
        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users.csv', '2;', '8d9b7412-ddf4-11e5-b86d-9a79f06e9478;', true);
        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users.csv', '3;', '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;', true);
        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users.csv', '4;', '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;', true);

        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '1;', '8d9b707a-ddf4-11e5-b86d-9a79f06e9478;', true);
        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '3;', '8d9b77f0-ddf4-11e5-b86d-9a79f06e9478;', true);
        jhipsterFunc.replaceContent('src/main/resources/config/liquibase/users_authorities.csv', '4;', '8d9b79c6-ddf4-11e5-b86d-9a79f06e9478;', true);
      }
    },

    updateEntityFiles : function () {
      // Update existing entities to enable audit
      this.entitiesToUpdate = this.existingEntities;
      if (this.entitiesToUpdate && this.entitiesToUpdate.length > 0 && this.entitiesToUpdate != 'none') {
        this.log('\n' + chalk.bold.green('I\'m Updating selected entities ') + chalk.bold.yellow(this.entitiesToUpdate));
        var jsonObj = null;
        this.auditedEntities = [];

        this.entitiesToUpdate.forEach(function(entityName) {
          this.auditedEntities.push("\"" + entityName + "\"");
          {
            // check if repositories are already annotated
            var uuidGeneratorAnnotation = '@GeneratedValue.*"UUIDGenerator"';
            var pattern = new RegExp(uuidGeneratorAnnotation, 'g');

            var content = this.fs.read(this.javaDir + 'domain/' + entityName + '.java', 'utf8');

            if (!pattern.test(content)) {
              // We need to convert this entity

              // JAVA
              convertIDtoUUID(this.javaDir + 'domain/' + entityName + '.java', 'import java.util.Objects;');

              // DTO
              if(fs.existsSync(this.javaDir + 'service/dto/' + entityName + 'DTO.java')) {
                jhipsterFunc.replaceContent(this.javaDir + 'service/dto/' + entityName + 'DTO.java', 'import java.util.Objects;', 'import java.util.Objects;\nimport java.util.UUID;');
                longToUUID(this.javaDir + 'service/dto/' + entityName + 'DTO.java');
              }

              // Mapper
              if(fs.existsSync(this.javaDir + 'service/mapper/' + entityName + 'Mapper.java')) {
                jhipsterFunc.replaceContent(this.javaDir + 'service/mapper/' + entityName + 'Mapper.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
                longToUUID(this.javaDir + 'service/mapper/' + entityName + 'Mapper.java');
              }

              // And the Repository
              jhipsterFunc.replaceContent(this.javaDir + 'repository/' + entityName + 'Repository.java', 'import org.springframework.data.jpa.repository.*;', 'import java.util.UUID;\nimport org.springframework.data.jpa.repository.*;');
              longToUUID(this.javaDir + 'repository/' + entityName + 'Repository.java');

              // The Search Repository
              if(fs.existsSync(this.javaDir + 'repository/search/' + entityName + 'SearchRepository.java')) {
                jhipsterFunc.replaceContent(this.javaDir + 'repository/search/' + entityName + 'SearchRepository.java', 'import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;', 'import java.util.UUID;\nimport org.springframework.data.elasticsearch.repository.ElasticsearchRepository;');
                longToUUID(this.javaDir + 'repository/search/' + entityName + 'SearchRepository.java');
              }

              // Service
              if(fs.existsSync(this.javaDir + 'service/' + entityName + 'Service.java')) {
                jhipsterFunc.replaceContent(this.javaDir + 'service/' + entityName + 'Service.java', 'import org.springframework.data.domain.Page;', 'import java.util.UUID;\nimport org.springframework.data.domain.Page;');
                longToUUID(this.javaDir + 'service/' + entityName + 'Service.java');
              }

              // ServiceImp
              if(fs.existsSync(this.javaDir + 'service/impl/' + entityName + 'ServiceImpl.java')) {
                jhipsterFunc.replaceContent(this.javaDir + 'service/impl/' + entityName + 'ServiceImpl.java', 'import org.springframework.data.domain.Page;', 'import java.util.UUID;\nimport org.springframework.data.domain.Page;');
                longToUUID(this.javaDir + 'service/impl/' + entityName + 'ServiceImpl.java');
              }

              // Resource
              jhipsterFunc.replaceContent(this.javaDir + 'web/rest/' + entityName + 'Resource.java', 'import java.util.List;', 'import java.util.UUID;\nimport java.util.List;');
              longToUUID(this.javaDir + 'web/rest/' + entityName + 'Resource.java');

              // JavaScript
              var entityNameSpinalCased = _s.dasherize(_s.decapitalize(entityName));
              var stateFile = glob.sync(this.webappDir + '../webapp/app/entities/' + entityNameSpinalCased+ '/' + entityNameSpinalCased + '*.state.js')[0];
              jhipsterFunc.replaceContent(stateFile, '\{id\:int\}', '{id:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}}',true);

              // Liquidbase
              var file = glob.sync("src/main/resources/config/liquibase/changelog/*entity_" + entityName + ".xml")[0];
              jhipsterFunc.replaceContent(file, 'type="bigint"', 'type="uuid"',true);
              jhipsterFunc.replaceContent(file, 'autoIncrement="\\$\\{autoIncrement\\}"', '', true);

              // Test
              // TODO: Fix this
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'import java.util.List;', 'import java.util.List;\nimport java.util.UUID;');
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'getId\\(\\)\\.intValue\\(\\)', 'getId().toString()', true);
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'Long (.*) = 1L', 'UUID $1 = UUID.fromString("00000000-0000-0000-0000-000000000001")', true);
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'Long (.*) = 2L', 'UUID $1 = UUID.fromString("00000000-0000-0000-0000-000000000002")', true);
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'setId\\(1L\\);', 'setId(UUID.fromString("00000000-0000-0000-0000-000000000001"));', true);
              jhipsterFunc.replaceContent('src/test/java/'+this.packageFolder+'/web/rest/' + entityName + 'ResourceIntTest.java', 'DEFAULT_ITEM_ID\\.intValue\\(\\)', 'DEFAULT_ITEM_ID.toString()', true);
            }
          }
        }, this);
      }
    },


    registering: function () {
      try {
        jhipsterFunc.registerModule("generator-jhipster-postgresuuid-converter", "entity", "post", "app", "Postgresql Long to UUID converter");
      } catch (err) {
        this.log(chalk.red.bold('WARN!') + ' Could not register as a jhipster entity post creation hook...\n');
      }
    }
  },

  // install: function () {
  //   this.installDependencies();
  // },

  end: function () {
    this.log(chalk.bold.green('Finished running of Postgres Long Primary Keys to UUID converter. Enjoy !!!'));
  }
});
