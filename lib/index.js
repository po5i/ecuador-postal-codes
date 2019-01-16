const jsonData = require('./data.json');

const helperMixin = {
  lookup(query) {
    const boxed = new String(query);
    const queryString = boxed.valueOf().toLowerCase().trim();
    const items = this._items;

    return function() {
      return items.filter(item => ~item.name.toLowerCase().indexOf(queryString));
    }
  },
  
  itemsArray() {
    return this._items.map(item => item.name);
  },

  * itemsGenerator() {
    for (const key in this._items) {
      if (this._items.hasOwnProperty(key)) {
        const element = this._items[key];
        yield element;
      }
    }
  }
};

function Town(name, postalCode, city) {
  this.name = name;
  this.postalCode = postalCode;
  this.city = city;
}
Town.prototype.postalCodeAsNumber = function () {
  const boxed = new Number(this.postalCode);
  return boxed.valueOf()
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

  this._items = this.towns;
}

Object.assign(City.prototype, helperMixin);

City.prototype.townsArray = function () {
  return this.itemsArray();
};
City.prototype.townsGenerator = function () {
  return this.itemsGenerator();
};
City.prototype.lookupTowns = function (query) {
  const lookup = this.lookup(query);
  return lookup();
};

function Province(name, rawArray) {
  this.name = name;
  this.cities = Object
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

Province.prototype.citiesArray = function () {
  return this.itemsArray();
};
Province.prototype.citiesGenerator = function () {
  return this.itemsGenerator();
};
Province.prototype.lookupCities = function (query) {
  const lookup = this.lookup(query);
  return lookup();
};

function Country(rawData) {
  this.provinces = Object
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
                ...city.towns.filter(town => town.postalCode === queryString),
              ],
              [],
            )],
        [],
      );

    if (result.length > 1) {
      throw new Error('Multiple postal codes detected');
    }

    if (result.length === 0) {
      return null;
    }
    return result[0];
  };
}

Object.assign(Country.prototype, helperMixin);

Country.prototype.name = 'ECUADOR';
Country.prototype.capital = 'QUITO';
Country.prototype.provincesArray = function () {
  return this.itemsArray();
};
Country.prototype.provincesGenerator = function () {
  return this.itemsGenerator();
};
Country.prototype.lookupProvinces = function (query) {
  const lookup = this.lookup(query);
  return lookup();
};


const data = new Country(jsonData);

module.exports = {
  jsonData,
  data,
};
