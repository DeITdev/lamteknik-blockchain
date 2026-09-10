package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

const recordObjectType = "lamteknikRecord"

// SmartContract stores the common LamTeknik CDC envelope for every entity.
type SmartContract struct {
	contractapi.Contract
}

type Record struct {
	Entity            string `json:"entity"`
	RecordID          string `json:"recordId"`
	CreatedTimestamp  string `json:"createdTimestamp"`
	ModifiedTimestamp string `json:"modifiedTimestamp"`
	ModifiedBy        string `json:"modifiedBy"`
	AllData           string `json:"allData"`
}

type RecordMetadata struct {
	Entity            string `json:"entity"`
	RecordID          string `json:"recordId"`
	CreatedTimestamp  string `json:"createdTimestamp"`
	ModifiedTimestamp string `json:"modifiedTimestamp"`
	ModifiedBy        string `json:"modifiedBy"`
}

func (s *SmartContract) Ping(ctx contractapi.TransactionContextInterface) (string, error) {
	return "lamteknik-ledger ready", nil
}

func recordKey(ctx contractapi.TransactionContextInterface, entity string, recordID string) (string, error) {
	if entity == "" || recordID == "" {
		return "", fmt.Errorf("entity and recordId are required")
	}
	return ctx.GetStub().CreateCompositeKey(recordObjectType, []string{entity, recordID})
}

func (s *SmartContract) PutRecord(ctx contractapi.TransactionContextInterface, entity string, recordID string, createdTimestamp string, modifiedTimestamp string, modifiedBy string, allData string) error {
	key, err := recordKey(ctx, entity, recordID)
	if err != nil {
		return err
	}
	record := Record{Entity: entity, RecordID: recordID, CreatedTimestamp: createdTimestamp, ModifiedTimestamp: modifiedTimestamp, ModifiedBy: modifiedBy, AllData: allData}
	encoded, err := json.Marshal(record)
	if err != nil {
		return fmt.Errorf("marshal record: %w", err)
	}
	return ctx.GetStub().PutState(key, encoded)
}

func (s *SmartContract) GetRecord(ctx contractapi.TransactionContextInterface, entity string, recordID string) (*Record, error) {
	key, err := recordKey(ctx, entity, recordID)
	if err != nil {
		return nil, err
	}
	encoded, err := ctx.GetStub().GetState(key)
	if err != nil {
		return nil, fmt.Errorf("read record: %w", err)
	}
	if encoded == nil {
		return nil, fmt.Errorf("record %s/%s does not exist", entity, recordID)
	}
	var record Record
	if err := json.Unmarshal(encoded, &record); err != nil {
		return nil, fmt.Errorf("decode record: %w", err)
	}
	return &record, nil
}

func (s *SmartContract) RecordExists(ctx contractapi.TransactionContextInterface, entity string, recordID string) (bool, error) {
	key, err := recordKey(ctx, entity, recordID)
	if err != nil {
		return false, err
	}
	encoded, err := ctx.GetStub().GetState(key)
	if err != nil {
		return false, fmt.Errorf("read record: %w", err)
	}
	return encoded != nil, nil
}

func (s *SmartContract) GetRecordMetadata(ctx contractapi.TransactionContextInterface, entity string, recordID string) (*RecordMetadata, error) {
	record, err := s.GetRecord(ctx, entity, recordID)
	if err != nil {
		return nil, err
	}
	return &RecordMetadata{Entity: record.Entity, RecordID: record.RecordID, CreatedTimestamp: record.CreatedTimestamp, ModifiedTimestamp: record.ModifiedTimestamp, ModifiedBy: record.ModifiedBy}, nil
}

func (s *SmartContract) ListRecordIDs(ctx contractapi.TransactionContextInterface, entity string) ([]string, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(recordObjectType, []string{entity})
	if err != nil {
		return nil, fmt.Errorf("list record ids: %w", err)
	}
	defer iterator.Close()

	ids := make([]string, 0)
	for iterator.HasNext() {
		item, err := iterator.Next()
		if err != nil {
			return nil, err
		}
		_, parts, err := ctx.GetStub().SplitCompositeKey(item.Key)
		if err != nil || len(parts) != 2 {
			return nil, fmt.Errorf("invalid record key")
		}
		ids = append(ids, parts[1])
	}
	return ids, nil
}

func (s *SmartContract) CountRecords(ctx contractapi.TransactionContextInterface, entity string) (int, error) {
	ids, err := s.ListRecordIDs(ctx, entity)
	return len(ids), err
}

func (s *SmartContract) GetRecordIDByIndex(ctx contractapi.TransactionContextInterface, entity string, index string) (string, error) {
	i, err := strconv.Atoi(index)
	if err != nil || i < 0 {
		return "", fmt.Errorf("index must be a non-negative integer")
	}
	ids, err := s.ListRecordIDs(ctx, entity)
	if err != nil {
		return "", err
	}
	if i >= len(ids) {
		return "", fmt.Errorf("index %d is out of range", i)
	}
	return ids[i], nil
}

func (s *SmartContract) ListRecords(ctx contractapi.TransactionContextInterface, entity string) ([]*Record, error) {
	ids, err := s.ListRecordIDs(ctx, entity)
	if err != nil {
		return nil, err
	}
	records := make([]*Record, 0, len(ids))
	for _, id := range ids {
		record, err := s.GetRecord(ctx, entity, id)
		if err != nil {
			return nil, err
		}
		records = append(records, record)
	}
	return records, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		panic(fmt.Errorf("create LamTeknik chaincode: %w", err))
	}
	if err := chaincode.Start(); err != nil {
		panic(fmt.Errorf("start LamTeknik chaincode: %w", err))
	}
}
