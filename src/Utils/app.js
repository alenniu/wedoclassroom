import { is_same_day } from "./index";

export const is_same_lesson = (lesson1, lesson2) => {
    if(is_same_day(lesson1.date, lesson2.date)){
        const lesson1_start_time = new Date(lesson1.start_time);
        const lesson2_start_time = new Date(lesson2.start_time);

        return lesson1_start_time.getTime() === lesson2_start_time.getTime()
    }

    return false;
}