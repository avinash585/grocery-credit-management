create table shops (
    id binary(16) primary key,
    name varchar(255) not null,
    owner_name varchar(255) not null,
    phone varchar(20) not null,
    preferred_language varchar(32) not null,
    address varchar(255),
    village varchar(255),
    district varchar(255),
    state varchar(255),
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null
);

create table users (
    id binary(16) primary key,
    shop_id binary(16) not null,
    phone varchar(20) not null,
    password_hash varchar(255) not null,
    role varchar(32) not null,
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_users_shop foreign key (shop_id) references shops(id),
    constraint uk_users_phone unique (phone)
);

create table customers (
    id binary(16) primary key,
    shop_id binary(16) not null,
    name varchar(255) not null,
    phone varchar(20),
    preferred_language varchar(32) not null,
    outstanding_balance decimal(12,2) not null default 0,
    notes varchar(255),
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_customers_shop foreign key (shop_id) references shops(id)
);

create table products (
    id binary(16) primary key,
    shop_id binary(16) null,
    sku varchar(64) not null,
    barcode varchar(255),
    category varchar(255) not null,
    brand varchar(255),
    unit varchar(32) not null,
    selling_price decimal(12,2) not null,
    stock_quantity decimal(12,3) not null default 0,
    image_url varchar(255),
    enabled bit not null default 1,
    name_en varchar(255) not null,
    name_ta varchar(255),
    name_hi varchar(255),
    name_te varchar(255),
    name_kn varchar(255),
    name_ml varchar(255),
    aliases json,
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_products_shop foreign key (shop_id) references shops(id)
);

create table ledger_entries (
    id binary(16) primary key,
    shop_id binary(16) not null,
    customer_id binary(16) not null,
    type varchar(32) not null,
    amount decimal(12,2) not null,
    balance_after decimal(12,2) not null,
    metadata json,
    created_at timestamp(6) not null,
    updated_at timestamp(6) not null,
    deleted_at timestamp(6) null,
    constraint fk_ledger_shop foreign key (shop_id) references shops(id),
    constraint fk_ledger_customer foreign key (customer_id) references customers(id)
);

create index idx_users_phone on users(phone);
create index idx_customers_shop_name on customers(shop_id, name);
create index idx_customers_shop_phone on customers(shop_id, phone);
create index idx_products_shop_enabled on products(shop_id, enabled);
create index idx_products_sku on products(sku);
create index idx_ledger_customer_created on ledger_entries(customer_id, created_at);
create index idx_ledger_shop_type on ledger_entries(shop_id, type);

