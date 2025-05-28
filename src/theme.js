import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'light',
    useSystemColorMode: false,
}

const colors = {
    brand: {
        50: '#f5f0ff',
        100: '#e9e3ff',
        200: '#d4c5ff',
        300: '#b69dff',
        400: '#9c6dff',
        500: '#843dff',
        600: '#7c15ff',
        700: '#6800ef',
        800: '#5600c3',
        900: '#4700a0',
    },
}

const theme = extendTheme({
    config,
    colors,
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
        },
    },
})

export default theme 