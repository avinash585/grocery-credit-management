create table bills (
    id binary(16) primary key,
    shop_id binary(16) not null,
    customer_id binary(16) not null,
    status varchar(32) not null,
    subtotal decimal(12,2) not null default 0,
    tax_amount decimal(12,2) not null default 0,
    total_amount decimal(12,2) not null default 0,
    credit_bill bit not null default 0,
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_bills_shop foreign key (shop_id) references shops(id),
    constraint fk_bills_customer foreign key (customer_id) references customers(id)
);

create table bill_items (
    id binary(16) primary key,
    bill_id binary(16) not null,
    product_id binary(16) not null,
    quantity decimal(12,3) not null,
    unit_price decimal(12,2) not null,
    line_total decimal(12,2) not null,
    constraint fk_bill_items_bill foreign key (bill_id) references bills(id),
    constraint fk_bill_items_product foreign key (product_id) references products(id)
);

create table sync_operations (
    id binary(16) primary key,
    shop_id binary(16) not null,
    user_id binary(16) not null,
    client_operation_id varchar(80) not null,
    type varchar(80) not null,
    payload json not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_sync_shop foreign key (shop_id) references shops(id),
    constraint fk_sync_user foreign key (user_id) references users(id),
    constraint uk_sync_shop_client unique (shop_id, client_operation_id)
);

create index idx_bills_shop_created on bills(shop_id, created_at);
create index idx_bills_customer on bills(customer_id);
create index idx_sync_shop_created on sync_operations(shop_id, created_at);

