// Test WhatsApp API directly
const testWhatsApp = async () => {
  const testData = {
    name: "Test User",
    mobile: "917892045223", // Your test number
    email: "test@example.com",
    registrationId: "TEST001",
    registrationType: "Rotarian",
    amount: 5000,
    mealPreference: "Veg",
    tshirtSize: "L",
    clubName: "Test Club",
    orderId: "TEST001"
  };

  console.log('🧪 Testing WhatsApp API with data:', testData);
  console.log('🌐 Calling: https://sneha2026.in/api/send-whatsapp-confirmation');

  try {
    const response = await fetch('https://sneha2026.in/api/send-whatsapp-confirmation', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('📊 Raw Response:', result);

    try {
      const jsonResult = JSON.parse(result);
      console.log('📊 JSON Response:', JSON.stringify(jsonResult, null, 2));
    } catch (e) {
      console.log('⚠️ Response is not valid JSON');
    }

  } catch (error) {
    console.error('❌ Error testing WhatsApp API:', error.message);
    console.error('Stack:', error.stack);
  }
};

// Run the test
testWhatsApp();
