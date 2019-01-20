const jsonData = require('./data.json');

const itemsArray = items => items.map(item => item.name);
const lookup = (query, items) => {
  const queryString = query.toString().toLowerCase().trim();
  return items.filter(item => item.name.toLowerCase().indexOf(queryString) >= 0);
};
function * itemsGenerator (items) {
  for (const key in items) {
    if (items.hasOwnProperty(key)) {
      const element = items[key];
      yield element;
    }
  }
}

function createTown (name, postalCode) {
  return {
    name,
    postalCode,
    city: null,
    postalCodeAsNumber: () => postalCode.valueOf()
  };
}

function createCity (name, rawArray) {
  const towns = Object
    .keys(rawArray)
    .map(key => createTown(
      rawArray[key],
      key
    ));

  function backRef (city) {
    towns.forEach((town) => {
      town.city = city;
    });
  }

  return {
    name,
    province: null,
    towns,
    townsArray: () => itemsArray(towns),
    townsGenerator: () => itemsGenerator(towns),
    lookupTowns: query => lookup(query, towns),
    backRef
  };
}

function createProvince (name, rawArray) {
  const cities = Object
    .keys(rawArray)
    .map(key => createCity(
      rawArray[key].canton,
      rawArray[key].parroquias
    ));

  function lookupTowns (query) {
    return cities
      .reduce(
        (previous, city) => [...previous, ...city.lookupTowns(query)], []
      );
  }

  function backRef (province) {
    cities.forEach((city) => {
      city.province = province;
      city.backRef(city);
    });
  }

  return {
    name,
    country: null,
    cities,
    lookupTowns,
    citiesArray: () => itemsArray(cities),
    citiesGenerator: () => itemsGenerator(cities),
    lookupCities: query => lookup(query, cities),
    backRef
  };
}

function createCountry (rawData) {
  const provinces = Object
    .keys(rawData)
    .map(key => createProvince(
      rawData[key].provincia,
      rawData[key].cantones
    ));

  function lookupCities (query) {
    return provinces
      .reduce(
        (previous, province) => [...previous, ...province.lookupCities(query)], []
      );
  }

  function lookupTowns (query) {
    return provinces
      .reduce(
        (previous, province) => [...previous, ...province.lookupTowns(query)], []
      );
  }

  function lookupPostalCode (query) {
    const result = provinces
      .reduce(
        (previousProvince, province) => [
          ...previousProvince,
          ...province.cities
            .reduce(
              (previousCity, city) => [
                ...previousCity,
                ...city.towns.filter(town => town.postalCode === query)
              ],
              []
            )],
        []
      );

    if (result.length > 1) {
      throw new Error('Multiple postal codes detected');
    }

    if (result.length === 0) {
      return null;
    }

    return result[0];
  }

  function backRef (country) {
    provinces.forEach((province) => {
      province.country = country;
      province.backRef(province);
    });
  }

  return {
    name: 'ECUADOR',
    capital: 'QUITO',
    provinces,
    lookupCities,
    lookupTowns,
    lookupPostalCode,
    provincesArray: () => itemsArray(provinces),
    provincesGenerator: () => itemsGenerator(provinces),
    lookupProvinces: query => lookup(query, provinces),
    backRef
  };
}

const data = createCountry(jsonData);
data.backRef(data);

module.exports = {
  jsonData,
  data
};
