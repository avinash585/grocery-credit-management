package com.grammart.voice;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VoiceCommandServiceTest {
    private final VoiceCommandService service = new VoiceCommandService();

    @Test
    void parsesMixedLanguagePaymentCommand() {
        var response = service.parse("Kumar paid 500 rupees");

        assertThat(response.intent()).isEqualTo(VoiceIntent.RECEIVE_PAYMENT);
        assertThat(response.amount()).isEqualByComparingTo("500");
    }

    @Test
    void mapsRiceAliasesToPurchaseIntent() {
        var response = service.parse("add 2 kg arisi");

        assertThat(response.intent()).isEqualTo(VoiceIntent.ADD_PURCHASE);
        assertThat(response.productAlias()).isEqualTo("rice");
        assertThat(response.quantity()).isEqualTo("2 kg");
    }

    @Test
    void parsesMilkPriceQuestionWithoutGuessingRice() {
        var response = service.parse("What is the price of 4 litre of milk?");

        assertThat(response.intent()).isEqualTo(VoiceIntent.GET_PRODUCT_PRICE);
        assertThat(response.productAlias()).isEqualTo("milk");
        assertThat(response.quantity()).isEqualTo("4 litre");
    }
}
