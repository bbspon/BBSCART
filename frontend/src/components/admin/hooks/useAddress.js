import { useState, useEffect } from "react";
import { GetCountries, GetState, GetCity } from "react-country-state-city";

const useAddress = (selectedCountry, selectedState) => {
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        const fetchCountries = async () => {
            const countryList = await GetCountries();
            if (Array.isArray(countryList)) {
                setCountries(countryList.map(country => ({ value: country.id, label: country.name })));
            }
        };
        fetchCountries();
    }, []);

    useEffect(() => {
        const fetchStates = async () => {
            if (!selectedCountry) {
                setStates([]);
                return;
            }

            const country = countries.find(c => c.label === selectedCountry);
            if (country) {
                const stateList = await GetState(country.value);
                setStates(Array.isArray(stateList) ? stateList.map(state => ({ value: state.id, label: state.name })) : []);
            } else {
                setStates([]);
            }
        };

        if (countries.length > 0) fetchStates();
    }, [selectedCountry, countries]);

    useEffect(() => {
        const fetchCities = async () => {
            if (!selectedState) {
                setCities([]);
                return;
            }

            const country = countries.find(c => c.label === selectedCountry);
            const state = states.find(s => s.label === selectedState);
            if (country && state) {
                const cityList = await GetCity(country.value, state.value);
                setCities(Array.isArray(cityList) ? cityList.map(city => ({ value: city.id, label: city.name })) : []);
            } else {
                setCities([]);
            }
        };

        if (states.length > 0) fetchCities();
    }, [selectedState, states]);

    return { countries, states, cities };
};

export default useAddress;