const BaseGenerator = require('generator-jhipster/generators/generator-base');

module.exports = class extends BaseGenerator {

    importUUID(file, importNeedle = 'import java.util.List;') {
        this.replaceContent(file, importNeedle, `${importNeedle}\nimport java.util.UUID;`);
    }

    longToUUID(file) {
        this.importUUID(file, 'import java.util.Objects;');
        this.replaceContent(file, 'Long', 'UUID', true);
    }

    convertIDtoUUIDForColumn(file, importNeedle, columnName) {
        this.replaceContent(file, '@GeneratedValue.*', '@GeneratedValue', true);
        this.replaceContent(file, '.*@SequenceGenerator.*\n', '', true);
        this.longToUUID(file);
    }
};

