import { Box, Container, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

function MainLayout() {
    return (
        <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Container maxW="container.xl" px={4}>
                <Flex gap={4} py={4}>
                    <Box w="260px" display={{ base: 'none', md: 'block' }}>
                        <Sidebar />
                    </Box>
                    <Box flex={1}>
                        <Outlet />
                    </Box>
                </Flex>
            </Container>
        </Box>
    )
}

export default MainLayout 