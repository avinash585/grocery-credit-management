# ⚡ Quick Start - Transaction Management System

**5-Minute Setup Guide**

---

## 🚀 Step 1: Deploy Backend (2 minutes)

```bash
# 1. Backup database
pg_dump -h localhost -U grammart_user -d grammart_db > backup.sql

# 2. Start application (migration runs automatically)
cd apps/api
mvn spring-boot:run

# 3. Verify migration
curl http://localhost:8080/api/actuator/health
```

**Expected Output:**
```json
{"status":"UP"}
```

---

## 🧪 Step 2: Test API (1 minute)

```bash
# Set your auth token
TOKEN="your-jwt-token-here"

# Test getting reversal stats (should return empty data initially)
curl -X GET "http://localhost:8080/api/transactions/reversals/stats?shopId=demo-shop" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Output:**
```json
{
  "totalReversals": 0,
  "reasonCounts": {},
  "totalReversedAmount": 0.00
}
```

---

## 💻 Step 3: Create Frontend Components (2 minutes)

### Copy Timeline Component

Create `apps/web/components/transaction-timeline.tsx` - **Code in TRANSACTION_MANAGEMENT_IMPLEMENTATION.md section "Create Transaction Timeline Component"**

### Copy Reversal Dialog

Create `apps/web/components/reversal-dialog.tsx` - **Code in TRANSACTION_MANAGEMENT_IMPLEMENTATION.md section "Create Reversal Dialog Component"**

---

## ✅ Step 4: Verify Installation

```sql
-- Connect to database
psql -h localhost -U grammart_user -d grammart_db

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('transaction_audits', 'transaction_timeline', 'reversal_reasons_metadata');

-- Should return 3 rows

-- Check sample data
SELECT reason_code, display_name FROM reversal_reasons_metadata LIMIT 5;

-- Should return 5 reversal reasons
```

---

## 🎯 Usage Examples

### Reverse a Transaction via API

```bash
curl -X POST http://localhost:8080/api/transactions/reverse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "billId": "your-bill-uuid",
    "reason": "WRONG_CUSTOMER",
    "customReason": "Selected wrong customer from dropdown"
  }'
```

### Get Customer Timeline

```bash
curl -X GET "http://localhost:8080/api/customers/{customer-id}/timeline?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Undo Last Transaction

```bash
curl -X POST http://localhost:8080/api/transactions/undo-last \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customerId": "customer-uuid",
    "reason": "DUPLICATE_ENTRY",
    "customReason": "Accidentally saved twice"
  }'
```

---

## 📚 Full Documentation

- **Complete Guide:** `TRANSACTION_MANAGEMENT_SYSTEM.md`
- **Implementation:** `TRANSACTION_MANAGEMENT_IMPLEMENTATION.md`
- **Status Summary:** `IMPLEMENTATION_COMPLETE.md`

---

## 🆘 Troubleshooting

### Migration Failed?

```bash
# Check if tables exist
psql -h localhost -U grammart_user -d grammart_db \
  -c "SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'transaction%';"

# If tables don't exist, run migration manually
psql -h localhost -U grammart_user -d grammart_db \
  -f apps/api/src/main/resources/db/migration/V10__transaction_management_system.sql
```

### API Not Working?

```bash
# Check application logs
tail -f apps/api/logs/application.log

# Verify database connection
curl http://localhost:8080/api/actuator/health
```

### Need to Rollback?

```bash
# Restore from backup
psql -h localhost -U grammart_user -d grammart_db < backup.sql
```

---

## ✅ Success Checklist

- [ ] Database migration ran successfully
- [ ] Health check returns UP
- [ ] API endpoints respond correctly
- [ ] Timeline query returns data
- [ ] Reversal reasons loaded (12 entries)
- [ ] Frontend components created
- [ ] Test transaction reversed successfully

---

**Ready in 5 minutes! 🎉**

