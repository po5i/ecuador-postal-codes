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

    it('Search for a Guayaquil city from province', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const city = province.lookupCities('Guayaquil')[0];

      expect(city).to.not.be.null;
      expect(city.province).to.have.property('name', 'GUAYAS');
    });

    it('Search for a Guayaquil city from country', () => {
      const city = ecuador.data.lookupCities('Guayaquil')[0];

      expect(city).to.not.be.null;
      expect(city.province).to.have.property('name', 'GUAYAS');
    });

    it('Search for a Tarqui town from city', () => {
      const province = ecuador.data.lookupProvinces('GUAYAS')[0];
      const city = province.lookupCities('Guayaquil')[0];
      const town = city.lookupTowns('TARQUI')[0];

      expect(town.city).to.have.property('name', 'GUAYAQUIL');
      expect(town.city).to.have.nested.property('province.name', 'GUAYAS');
    });

    it('Search for a Tarqui town from country', () => {
      const town = ecuador.data.lookupTowns('TARQUI');

      expect(town.length).to.be.equals(4);
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

  describe('Postal code checking', () => {
    it('Iñaquito postal code should be 170112', () => {
      const town = ecuador.data.lookupTowns('Iñaquito');

      expect(town[0].postalCode).to.be.equals('170112');
    });
  });
});
