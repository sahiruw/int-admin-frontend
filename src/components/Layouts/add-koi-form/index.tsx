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
import { useLoading } from "@/app/loading-context";

export function AddKoiForm({ koi, onClose, setData }: { koi: KoiInfo; onClose: () => void, setData: (data: KoiInfo[]) => void }) {
    const { setLoading } = useLoading();
    const [koiOptions, setKoiOptions] = useState<any[]>([]);
    const [breederOptions, setBreederOptions] = useState<any[]>([]);
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [shippingOptions, setShippingOptions] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({ ...koi });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [koiRes, breederRes, customerRes, shipRes] = await Promise.all([
                    fetch('/api/varieties', { cache: 'force-cache' }),
                    fetch('/api/breeders', { cache: 'force-cache' }),
                    fetch('/api/customers', { cache: 'force-cache' }),
                    fetch('/api/shipping-locations', { cache: 'force-cache' })
                ]);

                const [koiData, breederData, customerData, shipData] = await Promise.all([
                    koiRes.json(), breederRes.json(), customerRes.json(), shipRes.json()
                ]);

                setKoiOptions(koiData
                    .map((item: Varity) => ({ label: item.variety, value: item.id }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                );
                setBreederOptions(breederData
                    .map((item: Breeder) => ({ label: item.name, value: item.id }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                );
                setCustomerOptions(customerData
                    .map((item: Customer) => ({ label: item.name, value: item.id }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                );
                setShippingOptions(shipData
                    .map((item: Location) => ({ label: item.name, value: item.id }))
                    .sort((a, b) => a.label.localeCompare(b.label))
                );
            } catch (err) {
                console.error("Failed to fetch options", err);
            }
        };
        fetchOptions();
    }, []);

    const handleSave = async () => {
        setLoading(true)
        const changed: any = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== (koi as any)[key]) {
                changed[key] = formData[key];
            }
        });

        if (Object.keys(changed).length === 0) {
            onClose();
            toast.error("No changes made");
            return;
        }

        try {
            const payload = [{ picture_id: koi.picture_id, ...changed }];
            const res = await fetch('/api/koi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload }),
            });

            if (!res.ok) {
                toast.error("Failed to save");
                throw new Error("Failed to save");
            }

            const updatedKoi = { ...koi, ...changed };

            for (const key in changed) {
                if (key === "breeder_id") {
                    const selectedBreeder = breederOptions.find((item) => item.value === changed[key]);
                    updatedKoi.breeder_name = selectedBreeder ? selectedBreeder.label : "";
                }
                if (key === "koi_id") {
                    const selectedKoi = koiOptions.find((item) => item.value === changed[key]);
                    updatedKoi.variety_name = selectedKoi ? selectedKoi.label : "";
                }
                if (key === "customer_id") {
                    const selectedCustomer = customerOptions.find((item) => item.value === changed[key]);
                    updatedKoi.customer_name = selectedCustomer ? selectedCustomer.label : "";
                }
                if (key === "ship_to") {
                    const selectedLocation = shippingOptions.find((item) => item.value === changed[key]);
                    updatedKoi.location_name = selectedLocation ? selectedLocation.label : "";
                }
            }


            setData((prev) =>
                prev.map((k) => (k.picture_id === koi.picture_id ? updatedKoi : k))
            );
            onClose();
        } catch (err) {
            toast.error("Failed to save");
            console.error("Save failed", err);
        }
        finally {
            setLoading(false)
        }
    };


    const [saleCurrency, setSaleCurrency] = useState("JPY");
    useEffect(() => {
        if (formData.sale_price_jpy) {
            setSaleCurrency("JPY");
        }
        else if (formData.sale_price_usd) {
            setSaleCurrency("USD");
        }
    }, [formData.sale_price_jpy, formData.sale_price_usd]);
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
                            setValue={setSaleCurrency}
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
