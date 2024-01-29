// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

interface IZapper {
    error ZeroTokenBalance(address token);

    function zapInToken(
        address _from,
        address _pair,
        uint[] memory amounts,
        address routerAddr
    ) external;

    function zapOutToken(
        address _from,
        uint amount,
        address _to,
        address routerAddr,
        address _recipient
    ) external;
}
