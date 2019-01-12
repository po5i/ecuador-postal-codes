# ecuador-postal-codes
A Node.js module to fetch and query postal codes from Ecuador.

## Installation 
```sh
npm install ecuador-postal-codes --save
yarn add ecuador-postal-codes
```

## Usage

```javascript
var ecuador = require('ecuador-postal-codes');
```

### Members

- `provinces`: Array of Province objects
- `provincesArray`: Array of province names
- `lookupProvinces(<query>)`: Returns an array of Province objects
- `lookupCities(<query>)`: Returns an array of City objects
- `lookupTowns(<query>)`: Returns an array of Town objects


### Search provinces example
```javascript
var results = ecuador.data.lookupProvinces('GUAYAS');
```

### Province members
Each Province object contains:

- `name`: Name of the province in uppercase
- `cities`: Array of City objects.
- `citiesArray`: Array of city names.
- `lookupCities(<query>)`: Returns an array of City objects
- `lookupTowns(<query>)`: Returns an array of Town objects

### Search cities examples
```javascript
var results = ecuador.data.lookupCities('Quito');
```

Or you can searh within any province

```javascript
var results = provinceObject.lookupCities('Quito');
```

### City members
Each City object contains:

- `name`: Name of the city in uppercase
- `province`: Province object reference
- `towns`: Array of Town objects
- `townsArray`: Array of town names
- `lookupTowns(<query>)`: Returns an array of Town objects

### Search towns (AKA parroquias) examples
```javascript
var results = ecuador.data.lookupCities('Tarqui');
```

Or you can searh within any city

```javascript
var results = cityObject.lookupCities('Quito');
```

### Town members
Each Town object contains:

- `name`: Name of the city in uppercase
- `postalCode`: Postal code of the city as string
- `city`: City object reference
- `postalCodeAsNumber()`: Postal code of the city as number

## Contribute

Clone this repo, NPM-it and run the tests:

```sh
npm run test
```

## Thanks

Special thanks to @emamut for the [data].

[data]: https://gist.github.com/emamut/6626d3dff58598b624a1
