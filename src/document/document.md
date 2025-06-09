# Document Module

### Entity that represents the documents operation and handling

## Exemples payload

// src/document/schemas/contract.schema.ts
```json
{
	"parts_involved": {
		"contractor": {
			"name": "João Silva",
			"identifier": "529.982.247-25"
		},
		"contracted": {
			"name": "Company XYZ Ltd.",
			"identifier": "43.582.716/0001-50"
		}
	},
	"contract_value": {
		"value": "R$ 50,000.00",
		"payment_schedule": [
			{
				"percentage": "30%",
				"payment_due": "upon signing the contract"
			},
			{
				"percentage": "40%",
				"payment_due": "after the delivery of the partial report"
			},
			{
				"percentage": "30%",
				"payment_due": "after the delivery of the final report"
			}
		]
	},
	"signature_data": [
		{
			"name": "João Silva",
			"role": "contractor",
			"identifier": "529.982.247-25",
			"date": "May 31, 2025"
		},
		{
			"name": "Company XYZ Ltd.",
			"role": "contracted",
			"identifier": "43.582.716/0001-50",
			"date": "May 31, 2025"
		},
		{
			"name": "Maria Souza",
			"role": "witness",
			"identifier": "153.906.390-93",
			"date": "May 31, 2025"
		},
		{
			"name": "Carlos Oliveira",
			"role": "witness",
			"identifier": "765.289.407-01",
			"date": "May 31, 2025"
		}
	],
	"clause_fine": {
		"clause": "Clause 5 - Penalty for Noncompliance",
		"value": "10% of the total contract value"
	},
	"clause_prize": {
		"clause": null,
		"value": null,
		"details": null
	},
	"clause_duration": {
		"clause": "Clause 3 - Execution Period",
		"duration": "6 (six) months",
		"start_date": "May 31, 2025"
	},
	"created_at": "May 31, 2025"
}

```