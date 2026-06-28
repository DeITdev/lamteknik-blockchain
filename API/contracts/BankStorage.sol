// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankStorage {
    struct Bank {
        string recordId;
        uint256 createdTimestamp;
        uint256 modifiedTimestamp;
        string modifiedBy;
        string allData;
    }

    mapping(string => Bank) public bankRecords;
    string[] public bankIds;
    mapping(string => bool) public bankExists;

    event BankStored(string indexed recordId, uint256 createdTimestamp, uint256 modifiedTimestamp);
    event BankUpdated(string indexed recordId, uint256 modifiedTimestamp);

    function storeBank(
        string memory _recordId,
        uint256 _createdTimestamp,
        uint256 _modifiedTimestamp,
        string memory _modifiedBy,
        string memory _allData
    ) public returns (bool) {
        bool isNew = !bankExists[_recordId];

        bankRecords[_recordId] = Bank({
            recordId: _recordId,
            createdTimestamp: _createdTimestamp,
            modifiedTimestamp: _modifiedTimestamp,
            modifiedBy: _modifiedBy,
            allData: _allData
        });

        if (isNew) {
            bankIds.push(_recordId);
            bankExists[_recordId] = true;
            emit BankStored(_recordId, _createdTimestamp, _modifiedTimestamp);
        } else {
            emit BankUpdated(_recordId, _modifiedTimestamp);
        }

        return true;
    }

    function getBank(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy,
        string memory allData
    ) {
        require(bankExists[_recordId], "Bank does not exist");

        Bank memory item = bankRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy,
            item.allData
        );
    }

    function getTotalBank() public view returns (uint256) {
        return bankIds.length;
    }

    function getBankIdByIndex(uint256 _index) public view returns (string memory) {
        require(_index < bankIds.length, "Index out of bounds");
        return bankIds[_index];
    }

    function getAllBankIds() public view returns (string[] memory) {
        return bankIds;
    }

    function doesBankExist(string memory _recordId) public view returns (bool) {
        return bankExists[_recordId];
    }

    function retrieve() public view returns (
        uint256 totalBank,
        string[] memory allBankIds
    ) {
        return (bankIds.length, bankIds);
    }

    function getBankMetadata(string memory _recordId) public view returns (
        string memory recordId,
        uint256 createdTimestamp,
        uint256 modifiedTimestamp,
        string memory modifiedBy
    ) {
        require(bankExists[_recordId], "Bank does not exist");

        Bank memory item = bankRecords[_recordId];
        return (
            item.recordId,
            item.createdTimestamp,
            item.modifiedTimestamp,
            item.modifiedBy
        );
    }
}
