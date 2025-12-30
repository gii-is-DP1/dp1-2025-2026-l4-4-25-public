package es.us.dp1.l4_04_24_25.saboteur.square;

public enum GoalType {

    GOLD("gold"),
    CARBON_1("carbon_1"),
    CARBON_2("carbon_2");

    private final String value;

    GoalType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
