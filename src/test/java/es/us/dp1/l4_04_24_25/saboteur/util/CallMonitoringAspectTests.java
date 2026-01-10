package es.us.dp1.l4_04_24_25.saboteur.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import org.aspectj.lang.ProceedingJoinPoint;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CallMonitoringAspectTests {
    @Mock
    ProceedingJoinPoint joinPoint;

    @Test
    void testInvoke() throws Throwable {
        CallMonitoringAspect aspect = new CallMonitoringAspect();

        // Test default state
        assertTrue(aspect.isEnabled());
        assertEquals(0, aspect.getCallCount());

        // Test invocation
        when(joinPoint.toShortString()).thenReturn("testMethod");
        when(joinPoint.proceed()).thenReturn("result");

        Object res = aspect.invoke(joinPoint);

        assertEquals("result", res);
        assertEquals(1, aspect.getCallCount());

        // Test disabled
        aspect.setEnabled(false);
        aspect.invoke(joinPoint);
        assertEquals(1, aspect.getCallCount()); // Should not increment

        // Test reset
        aspect.reset();
        assertEquals(0, aspect.getCallCount());
        assertEquals(0, aspect.getCallTime());
    }
}
