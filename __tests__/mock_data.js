// Test data
const mockClientData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    password: 'securePassword',
    account_type: 'client',
    client: {
        client_company_name: 'Test Company',
        client_company_email: 'company@example.com',
        client_company_mobile: '9876543210',
        client_company_address: '123 Test St',
        client_company_website: 'www.example.com',
        client_company_handler_position: 'Manager'
    }
};

const mockSupplierData = {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    mobile: '0987654321',
    password: 'securePassword',
    account_type: 'supplier',
    supplier: {
        supplier_type: 'manufacturer',
        supplier_description: 'Test supplier',
        supplier_company_name: 'Supply Co',
        supplier_company_email: 'supply@example.com',
        supplier_company_mobile: '5555555555',
        supplier_company_address: '456 Supply St',
        supplier_company_website: 'www.supply.com',
        supplier_company_handler_position: 'Owner',
        supplier_approval_status: true,
        supplier_status_stage: 'approved'
    }
};

const mockSalespersonData = {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    mobile: '0987654321',
    password: 'securePassword',
    account_type: 'supplier',
    salesperosn: {
        sales_company_name: 'Supply Co',
        sales_company_email: 'supply@example.com',
        sales_company_mobile: '5555555555',
        sales_company_address: '456 Supply St',
        sales_company_position: 'sales',
        sales_description: 'sales seller',
        sales_consultation_status: true,
        sales_status_stage: 'approved'
    }
};

const mockAdminData = {
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@example.com',
    mobile: '1112223333',
    password: 'adminPass789',
    account_type: 'admin',
    role: 'super_admin'
};

module.exports = {
    mockClientData,
    mockSupplierData,
    mockSalespersonData,
    mockAdminData
};