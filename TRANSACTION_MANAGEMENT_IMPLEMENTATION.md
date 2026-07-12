# 🚀 Transaction Management System - Implementation Guide

**Version:** 1.0.0  
**Date:** 2026-07-12  
**Status:** Ready for Implementation

---

## 📋 Implementation Checklist

### Phase 1: Backend Setup ✅ COMPLETE

- [x] **Create Entity Classes**
  - [x] `TransactionTimeline.java` - Customer timeline events
  - [x] `TransactionAudit.java` - Audit trail records
  - [x] `AuditAction.java` - Action type enumeration
  - [x] `TimelineEventType.java` - Event type enumeration
  - [x] `ReversalReason.java` - Reversal reason enumeration

- [x] **Create Repository Interfaces**
  - [x] `TransactionAuditRepository.java` - Audit queries
  - [x] `TransactionTimelineRepository.java` - Timeline queries

- [x] **Create Service Layer**
  - [x] `TransactionManagementService.java` - Core business logic
  - [x] `TransactionDtos.java` - Request/Response DTOs

- [x] **Create REST Controller**
  - [x] `TransactionManagementController.java` - API endpoints

- [x] **Database Migration**
  - [x] `V10__transaction_management_system.sql` - Schema creation

- [x] **Update Existing Entities**
  - [x] Add `setOutstandingBalance()` to `Customer.java`
  - [x] Verify `Shop.getId()` exists

### Phase 2: Database Migration

#### Step 1: Backup Current Database
```bash
# PostgreSQL backup
pg_dump -h localhost -U grammart_user -d grammart_db > backup_before_v10.sql

# MySQL backup
mysqldump -u grammart_user -p grammart_db > backup_before_v10.sql
```

#### Step 2: Run Migration
```bash
# Using Flyway (automatic on app startup)
cd apps/api
mvn spring-boot:run

# Or manually apply migration
psql -h localhost -U grammart_user -d grammart_db -f src/main/resources/db/migration/V10__transaction_management_system.sql
```

#### Step 3: Verify Migration
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('transaction_audits', 'transaction_timeline', 'reversal_reasons_metadata');

-- Check indexes created
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('transaction_audits', 'transaction_timeline');

-- Verify sample data
SELECT reason_code, display_name FROM reversal_reasons_metadata;
```

### Phase 3: AI Assistant Integration

#### Update AI Assistant to Recognize Transaction Commands

Add to `AiAssistantService.java`:

```java
// Add transaction management intents
private static final Set<String> UNDO_KEYWORDS = Set.of(
    "undo", "reverse", "cancel", "rollback",
    "ரத்து", "திரும்ப", "மாற்று",
    "रद्द", "वापस", "रिवर्स"
);

private static final Set<String> TRANSFER_KEYWORDS = Set.of(
    "transfer", "move", "shift",
    "மாற்று", "மாற்றம்",
    "स्थानांतरण", "ट्रांसफर"
);

// Update multilingual prompt to include transaction commands
private String buildMultilingualPrompt(AiChatRequest request) {
    StringBuilder prompt = new StringBuilder();
    
    // ... existing prompt code ...
    
    // Add transaction management section
    prompt.append("\n\nTransaction Management Commands:\n");
    prompt.append("The assistant can perform these operations:\n");
    prompt.append("- Undo/Reverse: 'undo last transaction', 'reverse bill', 'cancel purchase'\n");
    prompt.append("- Transfer: 'transfer to Kumar', 'move bill to Lakshmi'\n");
    prompt.append("- Edit: 'rice should be 5 kg', 'change price to 55'\n");
    prompt.append("- Remove: 'remove rice', 'delete milk'\n");
    prompt.append("- Timeline: 'show history', 'show today's transactions'\n");
    
    prompt.append("\nWhen user requests transaction modification, append action block:\n");
    prompt.append("```action\n");
    prompt.append("{\n");
    prompt.append("  \"intent\": \"UNDO_TRANSACTION\" | \"TRANSFER_TRANSACTION\" | \"EDIT_ITEM\" | \"REMOVE_ITEM\" | \"SHOW_TIMELINE\",\n");
    prompt.append("  \"transactionId\": \"uuid\",\n");
    prompt.append("  \"targetCustomerId\": \"uuid\",\n");
    prompt.append("  \"reason\": \"WRONG_CUSTOMER\" | \"WRONG_PRODUCT\" | \"DUPLICATE_ENTRY\",\n");
    prompt.append("  \"customReason\": \"detailed explanation\"\n");
    prompt.append("}\n");
    prompt.append("```\n");
    
    return prompt.toString();
}
```

### Phase 4: Frontend Components

#### Create Transaction Timeline Component

```typescript
// components/transaction-timeline.tsx

import { useState, useEffect } from 'react';
import { Clock, ArrowLeft, Edit, Trash2, RefreshCw, DollarSign } from 'lucide-react';

interface TimelineEvent {
  id: string;
  eventType: string;
  eventIcon: string;
  eventTitle: string;
  eventDescription: string;
  amount: number;
  balanceAfter: number;
  adminUsername: string;
  isReversal: boolean;
  reversalReason: string | null;
  timestamp: string;
}

interface TransactionTimelineProps {
  customerId: string;
  filter?: 'ALL' | 'PURCHASES' | 'PAYMENTS' | 'REVERSALS' | 'EDITS';
  showFilters?: boolean;
}

export function TransactionTimeline({ customerId, filter = 'ALL', showFilters = true }: TransactionTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(filter);

  useEffect(() => {
    fetchTimeline();
  }, [customerId, selectedFilter]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/customers/${customerId}/timeline?eventType=${selectedFilter}&page=0&size=50`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      const data = await response.json();
      setEvents(data.content);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (eventType: string) => {
    if (eventType.includes('REVERSED') || eventType.includes('CANCELLED')) return 'text-red-600';
    if (eventType.includes('PAYMENT')) return 'text-green-600';
    if (eventType.includes('UPDATED')) return 'text-yellow-600';
    if (eventType.includes('TRANSFERRED')) return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PURCHASES', 'PAYMENTS', 'REVERSALS', 'EDITS'].map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedFilter === f
                  ? 'bg-ink text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading timeline...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No events found</div>
        ) : (
          <div className="space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative pl-14">
                {/* Icon circle */}
                <div
                  className={`absolute left-3 -ml-2 flex items-center justify-center w-10 h-10 rounded-full ${
                    event.isReversal ? 'bg-red-100' : 'bg-blue-100'
                  }`}
                >
                  <span className="text-2xl">{event.eventIcon}</span>
                </div>

                {/* Event card */}
                <div
                  className={`rounded-lg border-2 p-4 ${
                    event.isReversal
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold ${getEventColor(event.eventType)}`}>
                        {event.eventTitle}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{event.eventDescription}</p>
                      {event.isReversal && event.reversalReason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {event.reversalReason.replace(/_/g, ' ')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {event.amount && (
                        <p className={`font-bold ${event.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {event.amount < 0 ? '-' : '+'}Rs.{Math.abs(event.amount).toFixed(2)}
                        </p>
                      )}
                      {event.balanceAfter && (
                        <p className="text-xs text-gray-500">Balance: Rs.{event.balanceAfter.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                    <span>by {event.adminUsername}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### Create Reversal Dialog Component

```typescript
// components/reversal-dialog.tsx

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ReversalDialogProps {
  isOpen: boolean;
  transactionId: string;
  transactionAmount: number;
  customerName: string;
  onConfirm: (reason: string, customReason: string) => void;
  onCancel: () => void;
}

const REVERSAL_REASONS = [
  { value: 'WRONG_CUSTOMER', label: 'Wrong customer selected' },
  { value: 'WRONG_PRODUCT', label: 'Wrong product selected' },
  { value: 'WRONG_QUANTITY', label: 'Incorrect quantity' },
  { value: 'WRONG_PRICE', label: 'Incorrect price' },
  { value: 'DUPLICATE_ENTRY', label: 'Duplicate entry' },
  { value: 'CANCELLED_PURCHASE', label: 'Purchase cancelled' },
  { value: 'PAYMENT_ERROR', label: 'Payment error' },
  { value: 'CUSTOMER_REQUEST', label: 'Customer request' },
  { value: 'OTHER', label: 'Other reason' },
];

export function ReversalDialog({
  isOpen,
  transactionId,
  transactionAmount,
  customerName,
  onConfirm,
  onCancel,
}: ReversalDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const isLargeTransaction = transactionAmount > 5000;

  const handleConfirm = () => {
    if (!selectedReason) {
      alert('Please select a reason');
      return;
    }
    if (isLargeTransaction && !confirmed) {
      alert('Please confirm the reversal for this large transaction');
      return;
    }
    onConfirm(selectedReason, customReason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Reverse Transaction</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Large transaction warning */}
          {isLargeTransaction && (
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-900">Large Transaction Warning</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    This transaction is worth <strong>Rs.{transactionAmount.toFixed(2)}</strong>.
                    Reversing large transactions should be done carefully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transaction details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-red-600">Rs.{transactionAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{transactionId.substring(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for reversal <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            >
              <option value="">Select a reason...</option>
              {REVERSAL_REASONS.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Provide more context for this reversal..."
              rows={3}
              maxLength={500}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <p className="text-xs text-gray-500 mt-1">{customReason.length}/500 characters</p>
          </div>

          {/* Large transaction confirmation */}
          {isLargeTransaction && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="confirm-reversal"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="confirm-reversal" className="text-sm text-gray-700">
                I understand this is a large transaction and confirm the reversal
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || (isLargeTransaction && !confirmed)}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Reverse Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Phase 5: Integration with Existing Code

#### Update Customer Page to Show Timeline

Add to `apps/web/app/page.tsx`:

```typescript
import { TransactionTimeline } from '@/components/transaction-timeline';
import { ReversalDialog } from '@/components/reversal-dialog';

// Add state
const [showTimeline, setShowTimeline] = useState(false);
const [showReversalDialog, setShowReversalDialog] = useState(false);
const [reversalTransactionId, setReversalTransactionId] = useState<string | null>(null);

// Add timeline button to customer view
<ActionButton
  icon={Clock}
  label="Transaction History"
  active={showTimeline}
  onClick={() => setShowTimeline(!showTimeline)}
/>

// Add timeline component
{showTimeline && selectedCustomer && (
  <div className="mt-4">
    <TransactionTimeline customerId={selectedCustomer.id} showFilters={true} />
  </div>
)}

// Add reversal dialog
<ReversalDialog
  isOpen={showReversalDialog}
  transactionId={reversalTransactionId || ''}
  transactionAmount={selectedBillAmount}
  customerName={selectedCustomer?.name || ''}
  onConfirm={async (reason, customReason) => {
    await fetch('/api/transactions/reverse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        billId: reversalTransactionId,
        reason,
        customReason,
      }),
    });
    setShowReversalDialog(false);
    // Refresh customer data
    fetchCustomerData();
  }}
  onCancel={() => setShowReversalDialog(false)}
/>
```

### Phase 6: Testing

#### Backend Unit Tests

Create `TransactionManagementServiceTest.java`:

```java
@SpringBootTest
class TransactionManagementServiceTest {

    @Autowired
    private TransactionManagementService transactionService;

    @Test
    void testReverseBill() {
        // Create test bill
        UUID billId = createTestBill();
        
        // Reverse it
        TransactionReversalResult result = transactionService.reverseBill(
            billId,
            ReversalReason.WRONG_CUSTOMER,
            "Test reversal",
            "test-admin",
            "127.0.0.1"
        );
        
        assertThat(result.success()).isTrue();
        assertThat(result.reversedAmount()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void testUndoLastTransaction() {
        UUID customerId = createTestCustomer();
        createTestBill(customerId);
        
        TransactionReversalResult result = transactionService.undoLastTransaction(
            customerId,
            ReversalReason.DUPLICATE_ENTRY,
            "Undo test",
            "test-admin",
            "127.0.0.1"
        );
        
        assertThat(result.success()).isTrue();
    }

    @Test
    void testTransferTransaction() {
        UUID billId = createTestBill();
        UUID targetCustomerId = createTestCustomer();
        
        TransactionTransferResult result = transactionService.transferTransaction(
            billId,
            targetCustomerId,
            ReversalReason.WRONG_CUSTOMER,
            "Transfer test",
            "test-admin",
            "127.0.0.1"
        );
        
        assertThat(result.success()).isTrue();
        assertThat(result.sourceCustomerId()).isNotEqualTo(result.targetCustomerId());
    }
}
```

#### API Integration Tests

```bash
# Test reverse bill
curl -X POST http://localhost:8080/api/transactions/reverse \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "billId": "550e8400-e29b-41d4-a716-446655440000",
    "reason": "WRONG_CUSTOMER",
    "customReason": "Test reversal"
  }'

# Test get timeline
curl -X GET "http://localhost:8080/api/customers/770e8400-e29b-41d4-a716-446655440000/timeline?page=0&size=20" \
  -H "Authorization: Bearer $TOKEN"

# Test get audit history
curl -X GET http://localhost:8080/api/transactions/550e8400-e29b-41d4-a716-446655440000/audit \
  -H "Authorization: Bearer $TOKEN"
```

### Phase 7: Deployment

#### Pre-Deployment Checklist

- [ ] **Database Backup**
  - [ ] Create full database backup
  - [ ] Test backup restoration

- [ ] **Migration Testing**
  - [ ] Run migration on staging database
  - [ ] Verify all tables created
  - [ ] Verify all indexes created
  - [ ] Check sample data inserted

- [ ] **Code Review**
  - [ ] Review all new entity classes
  - [ ] Review service logic
  - [ ] Review controller endpoints
  - [ ] Review database migration

- [ ] **Testing**
  - [ ] Run unit tests
  - [ ] Run integration tests
  - [ ] Test API endpoints manually
  - [ ] Test frontend components

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Update user guide
  - [ ] Create training materials

#### Deployment Steps

1. **Stop Application**
   ```bash
   # Stop backend
   systemctl stop grammart-api
   
   # Stop frontend (if needed)
   pm2 stop grammart-web
   ```

2. **Backup Database**
   ```bash
   pg_dump -h localhost -U grammart_user -d grammart_db > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Deploy Code**
   ```bash
   # Pull latest code
   git pull origin main
   
   # Build backend
   cd apps/api
   mvn clean package -DskipTests
   
   # Build frontend
   cd ../web
   npm run build
   ```

4. **Run Migration**
   ```bash
   # Migration runs automatically on app startup
   cd apps/api
   java -jar target/grammart-api.jar
   ```

5. **Verify Deployment**
   ```bash
   # Check health
   curl http://localhost:8080/api/actuator/health
   
   # Check migration
   psql -h localhost -U grammart_user -d grammart_db -c "SELECT version FROM schema_migrations ORDER BY installed_on DESC LIMIT 5;"
   ```

6. **Start Application**
   ```bash
   systemctl start grammart-api
   pm2 start grammart-web
   ```

---

## 🎉 Post-Implementation

### User Training

1. **Admin Training Session**
   - Demonstrate transaction reversal
   - Show timeline functionality
   - Explain audit trail
   - Practice with test data

2. **User Guide**
   - Create step-by-step guides
   - Record video tutorials
   - Translate to local languages

### Monitoring

1. **Track Metrics**
   - Number of reversals per day
   - Most common reversal reasons
   - Average time to reverse
   - Large transaction reversals

2. **Set Up Alerts**
   - Alert on excessive reversals
   - Alert on reversals > Rs.10,000
   - Alert on system errors

---

## 📞 Support

**Issues?**
- Check logs: `tail -f apps/api/logs/application.log`
- Check database: Verify tables exist
- Check API: Test endpoints with curl

**Need Help?**
- Review `TRANSACTION_MANAGEMENT_SYSTEM.md`
- Check audit trail for debugging
- Contact development team

---

**Implementation Status: ✅ Ready**  
**Last Updated: 2026-07-12**

