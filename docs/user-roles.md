# User Roles & Permissions

## Overview
The Rashtriya Nidhi Portal implements a comprehensive role-based access control (RBAC) system with 9 distinct user roles. Each role has specific permissions and access levels designed for government fund allocation workflows.

## Role Hierarchy

```
CENTRAL_ADMIN (Full System Control)
├── CENTRAL_REVIEWER (Central Review Authority)
├── STATE_ADMIN (State-level Administration)
│   └── STATE_OFFICER (Bill Creation)
├── AUDITOR (Read-only Audit Access)
├── CONTRACTOR (Entity Portal)
├── SUPPLIER (Entity Portal)
├── MEDIATOR (Entity Portal)
└── PUBLIC (Public Transparency)
```

## Detailed Role Descriptions

### 1. CENTRAL_ADMIN
**Description**: Supreme authority with complete system access. Responsible for final sanction decisions and system administration.

**Key Responsibilities**:
- Final approval and disbursement of all bills
- User account management across all states
- Entity registration and management
- System configuration and maintenance
- Audit trail monitoring
- Security policy enforcement

**Access Level**: Global (all states, all data)

### 2. CENTRAL_REVIEWER
**Description**: Central government reviewers who evaluate bill submissions before final approval.

**Key Responsibilities**:
- Level 1 and Level 2 bill reviews
- Anomaly detection and fraud prevention
- Compliance verification
- Recommendation for approval/rejection
- Entity verification assistance

**Access Level**: Global (all states, read/write on bills)

### 3. STATE_ADMIN
**Description**: State-level administrators responsible for their state's fund allocation process.

**Key Responsibilities**:
- State-level bill approval (digital signature)
- State officer management
- Entity registration within state
- State-specific reporting and monitoring
- Coordination with central authorities

**Access Level**: State-restricted (own state only)

### 4. STATE_OFFICER
**Description**: Operational staff who create and submit fund bills for their state and department.

**Key Responsibilities**:
- Bill creation and submission
- Project documentation
- Fund split allocation to entities
- Status tracking and updates
- Communication with contractors/suppliers

**Access Level**: State-restricted (own state only)

### 5. CONTRACTOR
**Description**: Construction and infrastructure contractors who receive government payments.

**Key Responsibilities**:
- View payment status for their contracts
- Submit compliance documents
- Track project progress
- Receive payment notifications
- Dispute resolution

**Access Level**: Entity-restricted (own contracts only)

### 6. SUPPLIER
**Description**: Material and service suppliers for government projects.

**Key Responsibilities**:
- View payment status for their supplies
- Submit invoices and delivery proofs
- Track payment schedules
- Material quality assurance
- Supplier performance tracking

**Access Level**: Entity-restricted (own supplies only)

### 7. MEDIATOR
**Description**: Intermediary entities that facilitate project coordination.

**Key Responsibilities**:
- Project coordination and oversight
- Progress monitoring and reporting
- Quality assurance
- Dispute mediation
- Performance evaluation

**Access Level**: Entity-restricted (assigned projects only)

### 8. AUDITOR
**Description**: Independent auditors with read-only access to system data for compliance verification.

**Key Responsibilities**:
- Audit trail verification
- Compliance monitoring
- Fraud detection and reporting
- Financial transparency verification
- Regulatory reporting

**Access Level**: Global read-only (all data, no modifications)

### 9. PUBLIC
**Description**: General public and citizens with access to transparency portal.

**Key Responsibilities**:
- View sanctioned projects
- Track government spending
- Access project information
- Monitor fund utilization
- Public accountability

**Access Level**: Public read-only (sanctioned projects only)

## Permissions Matrix

### Bill Management Permissions

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | SUPPLIER | MEDIATOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|----------|----------|---------|--------|
| Create Bills | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View All Bills | ✓ | ✓ | State Only | State Only | Own Only | Own Only | Own Only | ✓ | Sanctioned |
| Edit Bills | ✓ | ✓ | ✓ | Own Drafts | ✗ | ✗ | ✗ | ✗ | ✗ |
| Delete Bills | ✓ | ✗ | ✗ | Own Drafts | ✗ | ✗ | ✗ | ✗ | ✗ |
| Review Bills | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Approve Bills | ✓ | Level 1/2 | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| State Signature | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Central Signature | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Disburse Funds | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Entity Management Permissions

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | SUPPLIER | MEDIATOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|----------|----------|---------|--------|
| Register Entities | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View All Entities | ✓ | ✓ | State Only | State Only | ✗ | ✗ | ✗ | ✓ | ✗ |
| View Own Entity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Edit Entities | ✓ | ✗ | State Only | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Deactivate Entities | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Upload Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

### User Management Permissions

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | SUPPLIER | MEDIATOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|----------|----------|---------|--------|
| Create Users | ✓ | ✗ | State Officers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View All Users | ✓ | ✓ | State Only | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Edit Users | ✓ | ✗ | State Officers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reset Passwords | ✓ | ✗ | State Officers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Deactivate Users | ✓ | ✗ | State Officers | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Audit & Monitoring Permissions

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | SUPPLIER | MEDIATOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|----------|----------|---------|--------|
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Export Audit Data | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Verify Blockchain | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| View Analytics | ✓ | ✓ | State Only | State Only | Own Only | Own Only | Own Only | ✓ | Public Stats |

### Dashboard & Reporting Permissions

| Permission | CENTRAL_ADMIN | CENTRAL_REVIEWER | STATE_ADMIN | STATE_OFFICER | CONTRACTOR | SUPPLIER | MEDIATOR | AUDITOR | PUBLIC |
|------------|---------------|------------------|-------------|---------------|------------|----------|----------|---------|--------|
| System Dashboard | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| State Dashboard | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Entity Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Public Portal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export Reports | ✓ | ✓ | State Only | State Only | Own Only | Own Only | Own Only | ✓ | Public Data |

## State-Level Data Isolation

### Access Control Rules
- **Central Roles** (CENTRAL_ADMIN, CENTRAL_REVIEWER, AUDITOR): Access all states
- **State Roles** (STATE_ADMIN, STATE_OFFICER): Restricted to assigned state
- **Entity Roles** (CONTRACTOR, SUPPLIER, MEDIATOR): Restricted to own entity
- **Public Role**: Access to sanctioned projects only

### Data Filtering Logic
```javascript
function enforceStateAccess(req, res, next) {
  const user = req.user;
  const centralRoles = ['CENTRAL_ADMIN', 'CENTRAL_REVIEWER', 'AUDITOR'];

  if (centralRoles.includes(user.role)) {
    return next(); // Full access
  }

  const requestedState = req.params.stateCode || req.body?.stateCode || req.query?.stateCode;
  if (requestedState && user.stateCode !== requestedState) {
    throw new Error('State access violation');
  }

  next();
}
```

### Entity-Specific Filtering
```javascript
function enforceEntityAccess(req, res, next) {
  const user = req.user;
  const entityRoles = ['CONTRACTOR', 'SUPPLIER', 'MEDIATOR'];

  if (!entityRoles.includes(user.role)) {
    return next(); // Other roles have different access rules
  }

  // Find user's entity and filter data accordingly
  const entity = await Entity.findOne({ contactEmail: user.email });
  if (!entity) {
    throw new Error('No associated entity found');
  }

  req.entityFilter = { 'fundSplit.entityNicId': entity.nicEntityId };
  next();
}
```

## Authentication Requirements

### Multi-Factor Authentication (MFA)
**Required for High-Privilege Roles**:
- CENTRAL_ADMIN
- STATE_ADMIN
- CENTRAL_REVIEWER

**MFA Process**:
1. Primary authentication (username/password)
2. OTP sent to registered mobile number
3. OTP verification within 5 minutes
4. Session establishment with JWT tokens

### Account Security
- **Password Complexity**: Minimum 8 characters, enforced by frontend
- **Account Lockout**: 5 failed attempts → 30-minute lockout
- **Session Timeout**: 8 hours for access tokens
- **Concurrent Sessions**: Single active session per user

## Role-Based UI Customization

### Navigation Menu Customization
```javascript
const menuItems = {
  CENTRAL_ADMIN: ['Dashboard', 'Users', 'Bills', 'Entities', 'Audit', 'Settings'],
  CENTRAL_REVIEWER: ['Dashboard', 'Bills', 'Entities', 'Audit'],
  STATE_ADMIN: ['Dashboard', 'State Bills', 'State Entities', 'State Users'],
  STATE_OFFICER: ['Dashboard', 'My Bills', 'Create Bill'],
  CONTRACTOR: ['Dashboard', 'My Projects', 'Payments'],
  AUDITOR: ['Dashboard', 'Audit Logs', 'Reports'],
  PUBLIC: ['Public Projects', 'Transparency']
};
```

### Page-Level Access Control
- **Frontend Guards**: Route protection based on user roles
- **Component Visibility**: Conditional rendering based on permissions
- **API Authorization**: Backend middleware enforcement
- **Real-time Updates**: Permission-based data filtering

## Workflow Integration

### Bill Approval Workflow
1. **Draft** → STATE_OFFICER creates bill
2. **Submitted** → AI anomaly check + auto-flagging
3. **Level 1 Review** → CENTRAL_REVIEWER approval/rejection
4. **Level 2 Review** → CENTRAL_ADMIN approval/rejection
5. **Awaiting State Sign** → STATE_ADMIN OTP signature
6. **Awaiting Central Sign** → CENTRAL_ADMIN final signature
7. **Sanctioned** → Funds ready for disbursement
8. **Disbursed** → Payments made to beneficiaries

### Role Permissions in Workflow
- **STATE_OFFICER**: Can create and submit bills
- **CENTRAL_REVIEWER**: Can review and approve/reject at Level 1/2
- **STATE_ADMIN**: Can provide state-level signature
- **CENTRAL_ADMIN**: Can provide final signature and disburse funds

## Audit & Compliance

### Role-Based Audit Logging
- **All Actions Logged**: User, timestamp, IP address, action details
- **Permission Checks**: Audit of authorization decisions
- **Data Access**: Logging of data retrieval operations
- **Security Events**: Failed login attempts, suspicious activities

### Compliance Monitoring
- **Role Segregation**: Prevention of conflict of interest
- **Access Reviews**: Regular review of user-role assignments
- **Permission Auditing**: Automated checks for excessive permissions
- **Compliance Reports**: Role-based access reports for auditors

## Role Management

### User Role Assignment
- **Central Admin Only**: CENTRAL_ADMIN can assign all roles
- **State Admin Limited**: STATE_ADMIN can assign STATE_OFFICER roles
- **Self-Registration**: Entity roles through verified registration
- **Role Changes**: Audited role modification history

### Role Lifecycle
1. **Creation**: User account creation with initial role
2. **Modification**: Role changes with approval workflow
3. **Suspension**: Temporary role deactivation
4. **Termination**: Permanent account deactivation
5. **Audit Trail**: Complete history of role changes

## Security Considerations

### Principle of Least Privilege
- **Minimal Permissions**: Users get minimum required permissions
- **Role Separation**: No single user has conflicting responsibilities
- **Access Reviews**: Regular review and cleanup of permissions
- **Just-in-Time Access**: Temporary elevated permissions when needed

### Risk Mitigation
- **State Isolation**: Prevents cross-state data access
- **Entity Isolation**: Contractors see only their contracts
- **Audit Monitoring**: Real-time monitoring of privilege usage
- **Incident Response**: Rapid role revocation in security incidents

## Future Role Enhancements

### Planned Features
- **Department-Specific Roles**: Finance, Technical, Legal roles
- **Project-Based Access**: Temporary access to specific projects
- **Delegation**: Temporary permission delegation
- **Approval Workflows**: Multi-level approval for role changes
- **Automated Provisioning**: Integration with government identity systems

### Advanced Access Control
- **Attribute-Based Access Control (ABAC)**: Permission based on user attributes
- **Time-Based Access**: Temporary permissions with expiration
- **Location-Based Access**: IP-based access restrictions
- **Device-Based Access**: Trusted device requirements