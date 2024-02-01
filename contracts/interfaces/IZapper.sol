// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

interface IZapper {
    event VirtualMonkeysMinted(address token, uint value);
    error ZeroTokenBalance(address token);
}
