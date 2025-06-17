'use client';
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { Select } from "@/components/FormElements/select";
import { RadioInput } from "@/components/FormElements/radio";
import { useEffect, useMemo, useState } from "react";
import { FilteredTextboxDropdown } from "@/components/FormElements/filteredselect";
import { Picker } from "@/components/FormElements/Dropdown";
import { Breeder, Customer, KoiInfo, Location, Varity } from "@/types/koi";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchVarieties } from "@/store/slices/varietiesSlice";
import { fetchBreeders } from "@/store/slices/breedersSlice";
import { fetchCustomers } from "@/store/slices/customersSlice";
import { fetchShippingLocations } from "@/store/slices/shippingLocationsSlice";
import { updateKoi, addKoi } from "@/store/slices/koiSlice";

export function AddKoiForm({ koi, onClose, setData }: { koi: KoiInfo; onClose: () => void, setData: () => void }) {
    const dispatch = useAppDispatch();
    const { varieties } = useAppSelector((state) => state.varieties);
    const { breeders } = useAppSelector((state) => state.breeders);
    const { customers } = useAppSelector((state) => state.customers);
    const { locations } = useAppSelector((state: any) => state.shippingLocations);
    const { isLoading } = useAppSelector((state) => state.ui);
    
    const [formData, setFormData] = useState<any>({ ...koi });
    const [saleCurrency, setSaleCurrency] = useState("JPY");

    // Derived options from Redux state
    const koiOptions = useMemo(() => 
        varieties
            .map((item: Varity) => ({ label: item.variety, value: String(item.id) }))
            .sort((a, b) => a.label.localeCompare(b.label)), 
        [varieties]
    );

    const breederOptions = useMemo(() => 
        breeders
            .map((item: Breeder) => ({ label: item.name, value: String(item.id) }))
            .sort((a, b) => a.label.localeCompare(b.label)), 
        [breeders]
    );

    const customerOptions = useMemo(() => 
        customers
            .map((item: Customer) => ({ label: item.name, value: String(item.id) }))
            .sort((a, b) => a.label.localeCompare(b.label)), 
        [customers]
    );

    const shippingOptions = useMemo(() => 
        locations
            .map((item: Location) => ({ label: item.name, value: String(item.id) }))
            .sort((a, b) => a.label.localeCompare(b.label)), 
        [locations]
    );

    useEffect(() => {
        // Fetch data from Redux if not already loaded
        if (!varieties.length) dispatch(fetchVarieties());
        if (!breeders.length) dispatch(fetchBreeders());
        if (!customers.length) dispatch(fetchCustomers());
        if (!locations.length) dispatch(fetchShippingLocations());
    }, [dispatch, varieties.length, breeders.length, customers.length, locations.length]);    const handleSave = async () => {
        const changed: any = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== (koi as any)[key]) {
                changed[key] = formData[key];
            }
        });

        if (Object.keys(changed).length === 0) {
            onClose();
            toast('No changes made', { icon: 'ℹ️' });
            return;
        }

        try {
            await dispatch(updateKoi({ id: koi.koi_id, data: changed })).unwrap();
            setData(); // Refresh the data
            onClose();
            toast.success("Koi updated successfully");
        } catch (err) {
            toast.error("Failed to save");
            console.error("Save failed", err);
        }
    };

    useEffect(() => {
        if (formData.sale_price_jpy) {
            setSaleCurrency("JPY");
        }
        else if (formData.sale_price_usd) {
            setSaleCurrency("USD");
        }
    }, [formData.sale_price_jpy, formData.sale_price_usd]);

    const handleCurrencyChange = (value: string) => {
        setSaleCurrency(value);
        if (value === "JPY") {
            setFormData({ ...formData, sale_price_jpy: formData.sale_price_usd, sale_price_usd: null });
        } else {
            setFormData({ ...formData, sale_price_usd: formData.sale_price_jpy, sale_price_jpy: null });
        }
    }

    const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (saleCurrency === "JPY") {
            setFormData({ ...formData, sale_price_jpy: Number(value), sale_price_usd: null });
        } else {
            setFormData({ ...formData, sale_price_usd: Number(value), sale_price_jpy: null });
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div className="bg-white dark:bg-dark-2 p-6 rounded-lg shadow-md" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                    <FilteredTextboxDropdown
                        label="Variety"
                        placeholder={formData.variety_name}
                        items={koiOptions}
                        onChange={(item) =>
                           setFormData({
                                ...formData,
                                koi_id: item
                            })}
                    />
                    <FilteredTextboxDropdown
                        label="Breeder"
                        placeholder={formData.breeder_name}
                        items={breederOptions}
                        onChange={(item) =>
                            setFormData({
                                ...formData,
                                breeder_id: item
                            })}
                    />
                    <FilteredTextboxDropdown
                        label="Customer"
                        placeholder={formData.customer_name}
                        items={customerOptions}
                        onChange={(item) =>
                            setFormData({
                                ...formData,
                                customer_id: item
                            })}
                    />
                    <FilteredTextboxDropdown
                        label="Shipping Location"
                        placeholder={formData.location_name}
                        items={shippingOptions}
                        onChange={(item) =>
                            setFormData({
                                ...formData,
                                ship_to: item
                            })}
                    />
                </div>


                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row">
                    <InputGroup
                        label="Sex"
                        type="text"
                        placeholder="Enter Sex"
                        value={formData.sex}
                        handleChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    />

                    <InputGroup
                        label="Age"
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        handleChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    />
                    <InputGroup
                        label="Size (cm)"
                        type="number"
                        placeholder="Enter size"
                        value={formData.size_cm}
                        handleChange={(e) => setFormData({ ...formData, size_cm: e.target.value })}
                    />
                    <InputGroup
                        label="No. of Pieces"
                        type="number"
                        placeholder="Enter pieces"
                        value={formData.pcs}
                        handleChange={(e) => setFormData({ ...formData, pcs: Number(e.target.value) })}
                    />
                </div>

                <div className="mb-4.5 flex flex-col gap-4.5 xl:flex-row items-center">
                    <InputGroup
                        label="Cost (JPY)"
                        type="number"
                        placeholder="Enter cost"
                        value={formData.jpy_cost || ''}
                        handleChange={(e) => setFormData({ ...formData, jpy_cost: Number(e.target.value) })}
                    />
                    <div className="flex flex-row gap-2 items-end ">
                        <InputGroup
                            label="Revenue"
                            type="number"
                            placeholder="Enter revenue"
                            value={formData.sale_price_jpy || formData.sale_price_usd || ''}
                            handleChange={handleSalePriceChange}
                        />
                        <Picker
                            items={["USD", "JPY"]}
                            value={saleCurrency}
                            setValue={handleCurrencyChange}
                            placeholder="Select Currency"
                        />
                    </div>
                </div>

                <div className="mt-6 flex w-full justify-end gap-4">
                    <button
                        className="rounded-lg bg-gray-300 p-[13px] font-medium text-gray-700 hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
