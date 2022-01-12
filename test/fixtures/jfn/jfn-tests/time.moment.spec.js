'use strict'

const isoStr = inp => inp

module.exports = [
  {
    title: 'plusTime - adds seconds',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'second'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12T00:00:00Z')
    },
    exp: isoStr('2021-12-12T00:00:01Z')
  },
  {
    title: 'plusTime - adds minutes',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'minute'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12T00:00:00Z')
    },
    exp: isoStr('2021-12-12T00:01:00Z')
  },
  {
    title: 'plusTime - adds hours',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'hour'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12T00:00:00Z')
    },
    exp: isoStr('2021-12-12T01:00:00Z')
  },
  {
    title: 'plusTime - adds hours and considers daylight saving time',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        2,
        'hour'
      ]
    },
    data: {
      timestamp: isoStr('2022-03-27T01:00:00+01:00')
    },
    exp: isoStr('2022-03-27T04:00:00+02:00')
  },
  {
    title: 'plusTime - adds hours and considers standard time',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        2,
        'hour'
      ]
    },
    data: {
      timestamp: isoStr('2022-10-30T02:00:00+02:00')
    },
    exp: isoStr('2022-10-30T03:00:00+01:00')
  },
  {
    title: 'plusTime - adds days',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'day'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12T00:00:00Z')
    },
    exp: isoStr('2021-12-13T00:00:00Z')
  },
  {
    title: 'plusTime - adds months in the middle of the month',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    exp: isoStr('2021-12-12T00:00:00Z')
  },
  {
    title: 'plusTime - adds months across years',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12T00:00:00Z')
    },
    exp: isoStr('2022-01-12T00:00:00Z')
  },
  {
    title: 'plusTime - adds months and considers the last day of the month (Jan to Feb)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2021-01-31T00:00:00Z')
    },
    exp: isoStr('2021-02-28T00:00:00Z')
  },
  {
    title: 'plusTime - adds months and considers the last day of the month (Jan to Feb in a leap year)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2020-01-31T00:00:00Z')
    },
    exp: isoStr('2020-02-29T00:00:00Z')
  },
  {
    title: 'plusTime - adds months and considers the last day of the month (Jan to Mar)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        2,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2021-01-31T00:00:00Z')
    },
    exp: isoStr('2021-03-31T00:00:00Z')
  },
  {
    title: 'plusTime - adds months and considers the last day of the month (Jan to Apr)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        3,
        'month'
      ]
    },
    data: {
      timestamp: isoStr('2021-01-31T00:00:00Z')
    },
    exp: isoStr('2021-04-30T00:00:00Z')
  },
  {
    title: 'plusTime - adds years',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    exp: isoStr('2022-11-12T00:00:00Z')
  },
  {
    title: 'plusTime - treats strings in date format (without time information) as UTC',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'hour'
      ]
    },
    data: {
      timestamp: isoStr('2021-12-12')
    },
    exp: isoStr('2021-12-12T01:00:00Z')
  },
  {
    title: 'plusTime - data types - throws if first parameter is a non-date string',
    logic: {
      plusTime: [
        'hello',
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is a number',
    logic: {
      plusTime: [
        123,
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is a boolean (true)',
    logic: {
      plusTime: [
        true,
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is a boolean (false)',
    logic: {
      plusTime: [
        false,
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is an array',
    logic: {
      plusTime: [
        [],
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is an object',
    logic: {
      plusTime: [
        {},
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if first parameter is null',
    logic: {
      plusTime: [
        null,
        1,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is a string',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        '1',
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is a boolean (true)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        true,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is a boolean (false)',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        false,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is an array',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        [],
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is an object',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        {},
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if second parameter is null',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        null,
        'year'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'plusTime - data types - throws if third parameter is not a supported value',
    logic: {
      plusTime: [
        {
          var: 'timestamp'
        },
        1,
        'decade'
      ]
    },
    data: {
      timestamp: isoStr('2021-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - supports seconds',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'second'
      ]
    },
    data: {
      left: isoStr('2021-11-12T00:00:10Z'),
      right: isoStr('2021-11-12T00:00:00Z')
    },
    exp: 10
  },
  {
    title: 'diffTime - returns a negative value if a is before b',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'second'
      ]
    },
    data: {
      left: isoStr('2021-11-12T00:00:00Z'),
      right: isoStr('2021-11-12T00:00:10Z')
    },
    exp: -10
  },
  {
    title: 'diffTime - supports minutes',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'minute'
      ]
    },
    data: {
      left: isoStr('2021-11-12T00:10:59Z'),
      right: isoStr('2021-11-12T00:00:00Z')
    },
    exp: 10
  },
  {
    title: 'diffTime - supports hours',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'hour'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2021-11-12T00:00:00Z')
    },
    exp: 10
  },
  {
    title: 'diffTime - supports months for a date in the middle of the month',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'month'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:00:00Z'),
      right: isoStr('2021-10-12T00:00:00Z')
    },
    exp: 1
  },
  {
    title: 'diffTime - supports months across years',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'month'
      ]
    },
    data: {
      left: isoStr('2022-01-12T10:00:00Z'),
      right: isoStr('2021-12-12T00:00:00Z')
    },
    exp: 1
  },
  {
    title: 'diffTime - supports months (Jan/Feb)',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'month'
      ]
    },
    data: {
      left: isoStr('2022-02-28T10:00:00Z'),
      right: isoStr('2022-01-31T00:00:00Z')
    },
    exp: 1
  },
  {
    title: 'diffTime - supports months (Jan/Mar)',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'month'
      ]
    },
    data: {
      left: isoStr('2022-03-31T10:00:00Z'),
      right: isoStr('2022-01-31T00:00:00Z')
    },
    exp: 2
  },
  {
    title: 'diffTime - supports months (Jan/Apr)',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'month'
      ]
    },
    data: {
      left: isoStr('2022-04-30T10:00:00Z'),
      right: isoStr('2022-01-31T00:00:00Z')
    },
    exp: 3
  },
  {
    title: 'diffTime - supports years',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    exp: 21
  },
  {
    title: 'diffTime - data types - throws if first parameter is non-date string',
    logic: {
      diffTime: [
        'hello',
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is a number',
    logic: {
      diffTime: [
        123,
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is a boolean (true)',
    logic: {
      diffTime: [
        true,
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is a boolean (false)',
    logic: {
      diffTime: [
        false,
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is an array',
    logic: {
      diffTime: [
        [],
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is an object',
    logic: {
      diffTime: [
        {},
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if first parameter is null',
    logic: {
      diffTime: [
        null,
        {
          var: 'right'
        },
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is a non-date string',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        'hello',
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is a number',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        123,
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is a boolean (true)',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        true,
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is a boolean (false)',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        false,
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is an array',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        [],
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is an object',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {},
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if second parameter is null',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        null,
        'year'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  },
  {
    title: 'diffTime - data types - throws if third parameter is not a supported value',
    logic: {
      diffTime: [
        {
          var: 'left'
        },
        {
          var: 'right'
        },
        'decade'
      ]
    },
    data: {
      left: isoStr('2021-11-12T10:59:00Z'),
      right: isoStr('2000-11-12T00:00:00Z')
    },
    throws: true
  }
]
