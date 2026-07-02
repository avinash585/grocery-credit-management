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
        assertThat(response.productAlias()).isEqualTo("arisi");
        assertThat(response.quantity()).isEqualTo("2 kg");
    }
}

