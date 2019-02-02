const R = require('ramda');
const jsonData = require('./data.json');

const helperMixin = {
  lookup(query) {
    const boxed = new String(query);
    const queryString = boxed.valueOf().toLowerCase().trim();
    const items = this._items;

    return function lookupFilter() {
      return R.filter(item => ~item.name.toLowerCase().indexOf(queryString), items);
    };
  },

  itemsArray() {
    return R.map(item => item.name, this._items);
  },

  * itemsGenerator() {
    yield* R.forEach(R.identity, this._items);
  },
};

function Town(name, postalCode, city) {
  this.name = name;
  this.postalCode = postalCode;
  this.city = city;
}
Town.prototype.postalCodeAsNumber = function postalCodeAsNumber() {
  const boxed = new Number(this.postalCode);
  return boxed.valueOf();
};

function City(name, rawArray, province) {
  this.name = name;
  this.province = province;
  this.towns = R.map(key => new Town(rawArray[key], key, this), R.keys(rawArray));

  this._items = this.towns;
}

Object.assign(City.prototype, helperMixin);

City.prototype.townsArray = function townsArray() {
  return this.itemsArray();
};
City.prototype.townsGenerator = function townsGenerator() {
  return this.itemsGenerator();
};
City.prototype.lookupTowns = function lookupTowns(query) {
  const lookup = this.lookup(query);
  return lookup();
};

function Province(name, rawArray) {
  this.name = name;
  this.cities = R
    .keys(rawArray)
    .map(key => new City(
      rawArray[key].canton,
      rawArray[key].parroquias,
      this,
    ));

  this._items = this.cities;

  this.lookupTowns = function lookupTowns(query) {
    return this.cities
      .reduce(
        (previous, city) => [...previous, ...city.lookupTowns(query)], [],
      );
  };
}

Object.assign(Province.prototype, helperMixin);

Province.prototype.citiesArray = function citiesArray() {
  return this.itemsArray();
};
Province.prototype.citiesGenerator = function citiesGenerator() {
  return this.itemsGenerator();
};
Province.prototype.lookupCities = function lookupCities(query) {
  const lookup = this.lookup(query);
  return lookup();
};

function Country(rawData) {
  this.provinces = R
    .keys(rawData)
    .map(key => new Province(
      rawData[key].provincia,
      rawData[key].cantones,
    ));

  this._items = this.provinces;

  this.lookupCities = function lookupCities(query) {
    return this.provinces
      .reduce(
        (previous, province) => [...previous, ...province.lookupCities(query)], [],
      );
  };
  this.lookupTowns = function lookupTowns(query) {
    return this.provinces
      .reduce(
        (previous, province) => [...previous, ...province.lookupTowns(query)], [],
      );
  };
  this.lookupPostalCode = function lookupPostalCode(query) {
    const boxed = new String(query);
    const queryString = boxed.valueOf();

    const result = this.provinces
      .reduce(
        (previousProvince, province) => [
          ...previousProvince,
          ...province.cities
            .reduce(
              (previousCity, city) => [
                ...previousCity,
                ...R.filter(town => town.postalCode === queryString, city.towns),
              ],
              [],
            )],
        [],
      );

    if (R.isEmpty(result)) {
      return null;
    }

    if (R.length(result) > 1) {
      throw new Error('Multiple postal codes detected');
    }

    return result[0];
  };
}

Object.assign(Country.prototype, helperMixin);

Country.prototype.name = 'ECUADOR';
Country.prototype.capital = 'QUITO';
Country.prototype.provincesArray = function provincesArray() {
  return this.itemsArray();
};
Country.prototype.provincesGenerator = function provincesGenerator() {
  return this.itemsGenerator();
};
Country.prototype.lookupProvinces = function lookupProvinces(query) {
  const lookup = this.lookup(query);
  return lookup();
};


const data = new Country(jsonData);

module.exports = {
  jsonData,
  data,
};
