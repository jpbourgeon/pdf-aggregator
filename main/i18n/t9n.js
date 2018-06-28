const en = require('./en');
const fr = require('./fr');

const data = { en, fr };

const t9n = (id, locale) => ((data[locale]) ? data[locale][id] : data.en[id]);

module.exports = t9n;
