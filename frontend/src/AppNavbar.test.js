import AppNavbar from "./AppNavbar";
import { render, screen } from "./test-utils";

describe('AppNavbar', () => {

    // Se han quitado aquellas pruebas que comprueban contenidos no existentes, todo ello recogido en las decisiones de diseño del sistema.
    /* test('renders public links correctly', () => {
        render(<AppNavbar />);
        const linkDocsElement = screen.getByRole('link', { name: 'Docs' });
        expect(linkDocsElement).toBeInTheDocument();

        const linkPlansElement = screen.getByRole('link', { name: 'Pricing Plans' });
        expect(linkPlansElement).toBeInTheDocument();

        const linkHomeElement = screen.getByRole('link', { name: 'logo PetClinic' });
        expect(linkHomeElement).toBeInTheDocument();
    });*/ 

    test('renders not user links correctly', () => {
        render(<AppNavbar />);
        const linkRegisterElement = screen.getByRole('link', { name: 'Register' });
        expect(linkRegisterElement).toBeInTheDocument();

        const linkLoginElement = screen.getByRole('link', { name: 'Login' });
        expect(linkLoginElement).toBeInTheDocument();
    });

});