const checkHealth = async (port, service) => {
    try {
        const res = await fetch(`http://localhost:${port}/health`);
        const data = await res.json();
        if (res.status === 200 && data.status === 'UP') {
            console.log(`✅ ${service} is UP`);
            return true;
        } else {
            console.log(`❌ ${service} returned ${res.status}`, data);
            return false;
        }
    } catch (e) {
        console.log(`❌ ${service} failed: ${e.message}`);
        return false;
    }
};

const runTests = async () => {
    console.log('--- 1. Infrastructure Health Check ---');
    await checkHealth(8000, 'API Gateway');
    await checkHealth(3001, 'User Service');
    await checkHealth(3002, 'Product Service');
    await checkHealth(3003, 'Order Service');
    await checkHealth(3004, 'Payment Service');
    await checkHealth(3005, 'Inventory Service');
    await checkHealth(3006, 'Notification Service');

    console.log('\n--- 2. Authentication Flow ---');
    let token = '';
    let userId = '';
    const email = `test${Date.now()}@example.com`;
    // Register
    try {
        const regRes = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'E2E Tester', email, password: 'password123' })
        });
        const regData = await regRes.json();
        if (regRes.status === 201) {
            console.log('✅ User Registered');
            token = regData.token;
            userId = regData._id;
        } else {
            console.log('❌ Registration Failed', regData);
        }
    } catch (e) { console.log('❌ Registration Error', e.message); }

    // Login (Verify)
    if (!token) {
        try {
            const loginRes = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'password123' })
            });
            const loginData = await loginRes.json();
            if (loginRes.status === 200) {
                console.log('✅ User Login Verified');
                token = loginData.token;
                userId = loginData._id;
            } else { console.log('❌ Login Failed', loginData); }
        } catch (e) { console.log('❌ Login Error', e.message); }
    }

    if (!token) {
        console.log('⛔ Stopping tests: Authentication failed');
        return;
    }

    console.log('\n--- 3. Product Flow ---');
    let productId = '';
    try {
        const prodRes = await fetch('http://localhost:3002/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Test Product ${Date.now()}`,
                description: 'E2E Test Item',
                price: 150,
                stock: 100,
                category: 'Testing'
            })
        });
        const prodData = await prodRes.json();
        if (prodRes.status === 201) {
            console.log('✅ Product Created');
            productId = prodData._id;
        } else { console.log('❌ Product Creation Failed', prodData); }
    } catch (e) { console.log('❌ Product Error', e.message); }

    console.log('\n--- 4. Order Flow ---');
    if (productId && userId) {
        try {
            const orderRes = await fetch('http://localhost:3003/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: userId,
                    items: [{ product: productId, name: 'Test Product', quantity: 2, price: 150 }],
                    totalAmount: 300
                })
            });
            const orderData = await orderRes.json();
            if (orderRes.status === 201) {
                console.log('✅ Order Created Successfully');
                console.log(`   Order ID: ${orderData._id}`);
                console.log('   (Check Payment/Inventory/Notification logs for async processing)');
            } else { console.log('❌ Order Creation Failed', orderData); }
        } catch (e) { console.log('❌ Order Error', e.message); }
    }

    console.log('\n--- 5. Rate Limiting Test (User Service) ---');
    let limited = false;
    for (let i = 0; i < 110; i++) {
        const res = await fetch('http://localhost:3001/health');
        if (res.status === 429) {
            console.log('✅ Rate Limit Hit (429 Received)');
            limited = true;
            break;
        }
    }
    if (!limited) console.log('⚠️ Rate Limit Not Triggered (Might need more requests)');

    console.log('\n--- End of Automated Verification ---');
};

runTests();
