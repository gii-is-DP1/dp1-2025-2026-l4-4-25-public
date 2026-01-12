package es.us.dp1.l4_04_24_25.saboteur.util;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

public final class RestPreconditions {
	
	private RestPreconditions() {
        throw new AssertionError();
    }

    // API

//    /**
//     * Comprobar si se encontró algún valor, de lo contrario lanzar excepción.
//     * 
//     * @param expression
//     *            tiene valor true si se encontró, de lo contrario false
//     * @throws MyResourceNotFoundException
//     *             si la expresión es false, significa que no se encontró el valor.
//     */
//    public static void checkFound(final boolean expression) {
//        if (!expression) {
//            throw new ResourceNotFoundException();
//        }
//    }
//
//    /**
//     * Comprobar si se encontró algún valor, de lo contrario lanzar excepción.
//     * 
//     * @param expression
//     *            tiene valor true si se encontró, de lo contrario false
//     * @throws MyResourceNotFoundException
//     *             si la expresión es false, significa que no se encontró el valor.
//     */
//    public static <T> T checkFound(final T resource) {
//        if (resource == null) {
//            throw new ResourceNotFoundException();
//        }
//
//        return resource;
//    }
    
    public static <T> T checkNotNull(final T resource,String resourceName, String fieldName, Object fieldValue) {
        if (resource == null) {
            throw new ResourceNotFoundException(resourceName, fieldName, fieldValue);
        }

        return resource;
    }
}
