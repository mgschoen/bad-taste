import 'regenerator-runtime/runtime.js';

import ComponentLoader from 'component-loader-js';
import LoadingSpinner from './components/LoadingSpinner';
import SortButton from './components/SortButton';
import QuotesList from './components/QuotesList';

const componentLoader = new ComponentLoader({
    LoadingSpinner,
    SortButton,
    QuotesList
});
window.componentLoader = componentLoader;

componentLoader.scan();