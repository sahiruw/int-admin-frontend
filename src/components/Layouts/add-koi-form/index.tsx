'use client';
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { RadioInput } from "@/components/FormElements/radio";
import { useState } from "react";
import {FilteredTextboxDropdown} from "@/components/FormElements/filteredselect";

export function AddKoiForm() {
    const [koiSearch, setKoiSearch] = useState("");
    const [breederSearch, setBreederSearch] = useState("");

    const koiOptions = [
        { label: "Koi 001", value: "001" },
        { label: "Koi 002", value: "002" },
        { label: "Koi 003", value: "003" },
    ];

    const breederOptions = [
        { label: "Breeder A", value: "A" },
        { label: "Breeder B", value: "B" },
        { label: "Breeder C", value: "C" },
    ];

    const filteredKoiOptions = koiOptions.filter((koi) =>
        koi.label.toLowerCase().includes(koiSearch.toLowerCase())
    );

    const filteredBreederOptions = breederOptions.filter((breeder) =>
        breeder.label.toLowerCase().includes(breederSearch.toLowerCase())
    );

    return (
        <form action="#">



            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                <InputGroup
                    label="Picture ID"
                    type="text"
                    className="mb-4.5"
                    placeholder="Enter Picture ID"
                    required
                />

                <FilteredTextboxDropdown
                    label="Breeder ID"
                    placeholder="Select Breeder ID"
                    className="mb-4.5"
                    items={breederOptions}
                    onChange={(value) => setBreederSearch(value)}
                />

                <FilteredTextboxDropdown
                    label="Koi ID"
                    placeholder="Select Koi ID"
                    className="mb-4.5"
                    items={koiOptions}
                    onChange={(value) => setKoiSearch(value)}
                />
            </div>

            <div className="mb-4.5">
                <label className="block text-sm font-medium text-gray-700">Sex</label>
                <div className="mt-2 flex gap-4">
                    <RadioInput label="Male" name="sex" value="male" />
                    <RadioInput label="Female" name="sex" value="female" />
                    <RadioInput label="Unknown" name="sex" value="unknown" />
                </div>
            </div>
            <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">

                <InputGroup
                    label="Age"
                    type="number"
                    placeholder="Enter age in years"
                    className="mb-4.5"
                />

                <InputGroup
                    label="Size (cm)"
                    type="number"
                    placeholder="Enter size in cm"
                    className="mb-4.5"
                />

                <InputGroup
                    label="No. of Pieces"
                    type="number"
                    placeholder="Enter number of pieces"
                    className="mb-4.5"
                />
            </div>




            <InputGroup
                label="Cost (JPY)"
                type="number"
                placeholder="Enter cost in JPY"
                className="mb-4.5"
            />

            <button className="mt-6 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
                Submit
            </button>
        </form>
    );
}