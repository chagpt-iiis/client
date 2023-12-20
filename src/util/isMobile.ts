import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { assert } from './type';

const isMobileQuery = window.matchMedia('only screen and (max-width: 991px)');

export const isMobileCenter: UseBoundStore<StoreApi<boolean>> = create(
	(set, get, api) => {
		assert(api.getState === get);
		assert(api.setState === set);
		isMobileQuery.addEventListener('change', () => set(isMobileQuery.matches));
		return isMobileQuery.matches;
	}
)
