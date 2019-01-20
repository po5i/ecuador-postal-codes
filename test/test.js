const { expect } = require('chai');
const { describe, it } = require('mocha');

const ecuador = require('../lib/index');

describe('Testing data', () => {
  it('jsonData should have AZUAY province', () => {
    const result = ecuador.jsonData;

    expect(result).to.have.nested.property('1.provincia', 'AZUAY');
  });

  it('data is consistent', () => {
    const country = ecuador.data;
    const province = country.provinces[0];
    const city = province.cities[0];
    const town = city.towns[0];

    expect(country).to.have.property('provinces');
    expect(province).to.have.property('cities');
    expect(city).to.have.property('towns');
    expect(town).to.have.property('name', 'BELLAVISTA');
    expect(town).to.have.property('postalCode', '10101');
  });
});

describe('Public methods', () => {
  it('List of Ecuador provinces should be 24', () => {
    const { data } = ecuador;

    expect(data.provinces.length).to.be.equals(24);
  });

  describe('Search methods', () => {
    it('Search for a Guayas province', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS');

      expect(province.length).to.be.equals(1);
    });

    it('Search for a invalid province', () => {
      const province = ecuador.data.lookupProvinces('XXX');

      expect(province.length).to.be.equals(0);
    });

    it('Search for a Guayaquil city from province', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const city = province.lookupCities('Guayaquil')[0];

      expect(city).to.not.equal(null);
      expect(city.province).to.have.property('name', 'GUAYAS');
    });

    it('Search for a Guayaquil city from country', () => {
      const city = ecuador.data.lookupCities('Guayaquil')[0];

      expect(city).to.not.equal(null);
      expect(city.province).to.have.property('name', 'GUAYAS');
    });

    it('Search for a invalid city from province', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const city = province.lookupCities('XXXX');

      expect(city.length).to.be.equals(0);
    });

    it('Search for a Tarqui town from city', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const city = province.lookupCities('Guayaquil')[0];
      const town = city.lookupTowns('TARQUI')[0];

      expect(town.city).to.have.property('name', 'GUAYAQUIL');
      expect(town.city).to.have.nested.property('province.name', 'GUAYAS');
    });

    it('Search for a Tarqui town from country', () => {
      const towns = ecuador.data.lookupTowns('TARQUI');
      const flatTowns = towns.map(town => town.name);

      expect(towns.length).to.be.equals(5);
      expect(flatTowns).to.includes('TARQUI');
      expect(flatTowns).to.includes('NUEVA TARQUI');
    });

    it('Search for a invalid town from country', () => {
      const town = ecuador.data.lookupTowns('XXXX');

      expect(town.length).to.be.equals(0);
    });
  });

  describe('Returned arrays', () => {
    it('Guayas cities should contain Guayaquil', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const cities = province.citiesArray();

      expect(cities).to.include('GUAYAQUIL');
    });

    it('Quito towns should contain Quitumbe', () => {
      const city = ecuador.data.lookupCities('Quito')[0];
      const towns = city.townsArray();

      expect(towns).to.include('QUITUMBE');
    });
  });

  describe('Returned generators', () => {
    it('Guayas cities should starts with Guayaquil', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const cities = province.citiesGenerator();

      expect(cities.next()).to.have.nested.property('value.name', 'GUAYAQUIL');
      cities.next();
      expect(cities.next()).to.have.nested.property('value.name', 'BALAO');
    });

    it('Quito towns should starts with Belisario Quevedo and Carcelén', () => {
      const city = ecuador.data.lookupCities('Quito')[0];
      const towns = city.townsGenerator();

      expect(towns.next()).to.have.nested.property('value.name', 'BELISARIO QUEVEDO');
      expect(towns.next()).to.have.nested.property('value.name', 'CARCELÉN');
    });
  });

  describe('Postal code checking', () => {
    it('Iñaquito postal code should be 170112', () => {
      const town = ecuador.data.lookupTowns('Iñaquito')[0];

      expect(town.postalCode).to.be.equals('170112');
    });

    it('Search for 170112 should return Iñaquito', () => {
      const town = ecuador.data.lookupPostalCode('170112');

      expect(town.name).to.be.equals('IÑAQUITO');
    });

    it('Search for invalid postal code', () => {
      const town = ecuador.data.lookupPostalCode('xxxx');

      expect(town).to.equal(null);
    });
  });
});
