const current_date = new Date();

export const CURRENT_YEAR = current_date.getFullYear();
export const IS_LEAP_YEAR = (CURRENT_YEAR % 4) === 0;

current_date.setDate(1);
current_date.setMonth(0);
current_date.setHours(1,1,1);

export const YEAR_START_DAY = current_date.getDay();


export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const LEAP_YEAR = DAY * 366;
export const NORMAL_YEAR = DAY * 365;
export const YEAR = DAY * (IS_LEAP_YEAR?LEAP_YEAR:NORMAL_YEAR);

export const WEEK_START = 1;

export const DAYS = [
    {long: "sunday", short: "sun", number: 0},
    {long: "monday", short: "mon", number: 1},
    {long: "tuesday", short: "tues", number: 2},
    {long: "wednesday", short: "wed", number: 3},
    {long: "thursday", short: "thu", number: 4},
    {long: "friday", short: "fri", number: 5},
    {long: "saturday", short: "sat", number: 6},
    {long: "sunday", short: "sun", number: 7},
]

export const get_months = (year=CURRENT_YEAR) => {
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

export const MONTHS = get_months(CURRENT_YEAR);

export const get_year_details = (year:Number=CURRENT_YEAR) => {
    if(year === CURRENT_YEAR){
        return {IS_LEAP_YEAR, YEAR_START_DAY, MONTHS, YEAR_TIME: YEAR};
    }else{
        const date = new Date(year, 0, 1, 0, 0, 1);
    
        const IS_LEAP_YEAR = (year % 4) === 0;
        const YEAR_START_DAY = date.getDay();
    
    
        const MONTHS = get_months(year);
        
        return {IS_LEAP_YEAR, YEAR_START_DAY, MONTHS, YEAR_TIME: IS_LEAP_YEAR?LEAP_YEAR:NORMAL_YEAR};
    }
}

export const verify_month = (month:Number) => Math.min(Math.max(0, month), 11);
export const verify_date = (month:Number, date:Number, year:Number=CURRENT_YEAR) => Math.min(Math.max(1, date), get_months(year)[verify_month(month)].days);

export const get_day = (month:Number=0, date:Number=1, year:Number=CURRENT_YEAR, style:String="long") => {
    month = verify_month(month);
    date = verify_date(month, date, year);

    const {IS_LEAP_YEAR, YEAR_START_DAY, MONTHS, YEAR_TIME} = get_year_details(year);

    const month_obj = MONTHS[month];
    
    return DAYS[((YEAR_START_DAY + month_obj.days_past + (date - 1)) % 7)][style];
}

export const get_week_date_range = (month:Number=0, date:Number=1, year:Number=CURRENT_YEAR) => {
    month = verify_month(month);
    date = verify_date(month, date, year);

    const {IS_LEAP_YEAR, YEAR_START_DAY, MONTHS, YEAR_TIME} = get_year_details(year);
    
    const month_obj = MONTHS[month];

    const day = DAYS[((YEAR_START_DAY + month_obj.days_past + (date - 1)) % 7)].number;
    const days_left = 6-day;

    return {min: date-day, max: date+days_left}
}