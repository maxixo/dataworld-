const XLSX = require('xlsx');
const path = require('path');

function createTestExcel() {
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet([]);
    
    // Add headers
    const headers = [
        "Order ID",
        "Customer Name",
        "Product Category",
        "Product Name",
        "Quantity",
        "Unit Price",
        "Total Amount",
        "Order Date",
        "Region",
        "Status",
        "Payment Method",
        "Shipping Cost"
    ];
    
    // Sample data
    const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"];
    const products = {
        "Electronics": ["Laptop", "Smartphone", "Tablet", "Headphones", "Camera"],
        "Clothing": ["T-Shirt", "Jeans", "Jacket", "Sneakers", "Watch"],
        "Home & Garden": ["Blender", "Coffee Maker", "Lamp", "Plant Pot", "Tool Set"],
        "Sports": ["Tennis Racket", "Yoga Mat", "Basketball", "Running Shoes", "Gym Bag"],
        "Books": ["Novel", "Textbook", "Magazine", "Comics", "Audiobook"]
    };
    const regions = ["North", "South", "East", "West", "Central"];
    const statuses = ["Completed", "Pending", "Shipped", "Delivered", "Cancelled"];
    const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Cash on Delivery"];
    const customerNames = [
        "John Smith", "Emily Johnson", "Michael Brown", "Sarah Davis", "David Wilson",
        "Jessica Martinez", "Christopher Lee", "Amanda Taylor", "Daniel Anderson", "Ashley Thomas",
        "Matthew Jackson", "Jennifer White", "Andrew Harris", "Michelle Martin", "Joshua Thompson",
        "Laura Garcia", "James Robinson", "Stephanie Clark", "Robert Rodriguez", "Nicole Lewis"
    ];
    
    // Generate data
    const data = [];
    const baseDate = new Date('2024-01-01');
    
    // Add headers as first row
    data.push(headers);
    
    // Generate 50 sample records
    for (let i = 2; i <= 51; i++) {
        const orderId = `ORD-${String(i).padStart(5, '0')}`;
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const productName = products[category][Math.floor(Math.random() * products[category].length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const unitPrice = parseFloat((Math.random() * 490 + 10).toFixed(2));
        const totalAmount = parseFloat((quantity * unitPrice).toFixed(2));
        const orderDate = new Date(baseDate.getTime() + Math.random() * 364 * 24 * 60 * 60 * 1000);
        const region = regions[Math.floor(Math.random() * regions.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const shippingCost = parseFloat((Math.random() * 20 + 5).toFixed(2));
        
        data.push([
            orderId,
            customerName,
            category,
            productName,
            quantity,
            unitPrice,
            totalAmount,
            orderDate.toISOString().split('T')[0],
            region,
            status,
            paymentMethod,
            shippingCost
        ]);
    }
    
    // Add data to worksheet
    XLSX.utils.sheet_add_aoa(ws, data);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 12 }, { wch: 18 }, { wch: 16 }, { wch: 18 },
        { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 },
        { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 14 }
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Data");
    
    // Save file
    const filename = path.join(__dirname, 'test_data_sales.xlsx');
    XLSX.writeFile(wb, filename);
    
    console.log('✓ Test Excel file created: test_data_sales.xlsx');
    console.log(`  - ${headers.length} columns`);
    console.log('  - 50 rows of sample data');
    console.log(`  - File location: ${filename}`);
    
    return filename;
}

// Run the function
try {
    createTestExcel();
} catch (error) {
    console.error('❌ Error creating Excel file:', error.message);
    console.error('Make sure xlsx is installed: npm install xlsx');
}
