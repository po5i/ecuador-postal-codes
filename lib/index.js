const jsonData = require('./data.json');

function lookup(list, query) {
  // TODO: improve search similar to SQL ILIKE
  return list.filter(province => province.name.toLowerCase() === query.toLowerCase().trim());
}

function itemsArray(list) {
  return list.map(item => item.name);
}

function Town(name, postalCode, city) {
  this.name = name;
  this.postalCode = postalCode;
  this.city = city;
}
Town.prototype.postalCodeAsNumber = function postalCodeAsNumber() {
  return parseInt(this.postalCode, 10);
};

function City(name, rawArray, province) {
  this.name = name;
  this.province = province;
  this.towns = Object
    .keys(rawArray)
    .map(key => new Town(
      rawArray[key],
      key,
      this,
    ));

  this.townsArray = function townsArray() {
    return itemsArray(this.towns);
  };

  this.lookupTowns = function lookupTowns(query) {
    return lookup(this.towns, query);
  };
}

function Province(name, rawArray) {
  this.name = name;
  this.cities = Object
    .keys(rawArray)
    .map(key => new City(
      rawArray[key].canton,
      rawArray[key].parroquias,
      this,
    ));

  this.citiesArray = function citiesArray() {
    return itemsArray(this.cities);
  };

  this.lookupCities = function lookupCities(query) {
    return lookup(this.cities, query);
  };
  this.lookupTowns = function lookupTowns(query) {
    return this.cities
      .reduce(
        (previous, city) => [...previous, ...city.lookupTowns(query)], [],
      );
  };
}

function Country(rawData) {
  this.provinces = Object
    .keys(rawData)
    .map(key => new Province(
      rawData[key].provincia,
      rawData[key].cantones,
    ));

  this.provincesArray = function provincesArray() {
    return itemsArray(this.provinces);
  };

  this.lookupProvinces = function lookupProvinces(query) {
    return lookup(this.provinces, query);
  };
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
}
Country.prototype.name = 'ECUADOR';
Country.prototype.capital = 'QUITO';


const data = new Country(jsonData);


module.exports = {
  jsonData,
  data,
};
