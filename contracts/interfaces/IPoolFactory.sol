// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

interface IPoolFactory {
    error IdenticalAddresses();
    error ZeroAddress();
    error PairExist();
    error Forbidden();
}
