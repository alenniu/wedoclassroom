module.exports.SECOND = 1000;
module.exports.MINUTE = this.SECOND * 60;
module.exports.HOUR = this.MINUTE * 60;
module.exports.DAY = this.HOUR * 24;
module.exports.WEEK = this.DAY * 7;
module.exports.YEAR = this.DAY * 365;

module.exports.is_leap_year = (year) => {
    year = year || (new Date().getFullYear())
    return (year % 4) === 0;
}

module.exports.get_months = (year) => {
    year = year || (new Date().getFullYear())
    const leap_year = (year % 4) === 0;

    return [
        {long: "january", short: "jan", days: 31, days_past: 0},
        {long: "february", short: "feb", days: leap_year?29:28, days_past: 31},
        {long: "march", short: "mar", days: 31, days_past: leap_year?60:59},
        {long: "april", short: "apr", days: 30, days_past: leap_year?91:90},
        {long: "may", short: "may", days: 31, days_past: leap_year?121:120},
        {long: "june", short: "jun", days: 30, days_past: leap_year?152:151},
        {long: "july", short: "jul", days: 31, days_past: leap_year?182:181},
        {long: "august", short: "aug", days: 31, days_past: leap_year?213:212},
        {long: "september", short: "sept", days: 30, days_past: leap_year?244:243},
        {long: "october", short: "oct", days: 31, days_past: leap_year?274:273},
        {long: "november", short: "nov", days: 30, days_past: leap_year?305:304},
        {long: "december", short: "dec", days: 31, days_past: leap_year?335:334},
    ]
}