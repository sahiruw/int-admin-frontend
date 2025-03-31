"use client";

import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { useEffect } from "react";

type DatePickerOneProps = {
  value?: string;
  onDateChange: any;
  label?: string;
  minDate?: string;
  maxDate?: string;
};

const DatePickerOne = (
  { onDateChange, 
    value,
    label = "Date picker",
    minDate = "01/01/1900",
    maxDate = "01/01/2100"
   }: DatePickerOneProps
) => {


  return (
    <div>
      <label className="mb-3 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          className="form-datepicker w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5 py-3 font-normal outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary"
          placeholder="mm/dd/yyyy"
          data-class="flatpickr-right"
          onChange={(e) => onDateChange(e.target.value)}
          value={value}
          type="date"
          min={minDate}
          max={maxDate}
        />

      </div>
    </div>
  );
};

export default DatePickerOne;
