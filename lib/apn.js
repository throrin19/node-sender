const debug = require("debug")("apn");

const parse = require("./apn/credentials/parse")({
    parsePkcs12  : require("./apn/credentials/parsePkcs12"),
    parsePemKey  : require("./apn/credentials/parsePemKey"),
    parsePemCert : require("./apn/credentials/parsePemCertificate"),
});

const prepareCredentials = require("./apn/credentials/prepare")({
    load     : require("./apn/credentials/load"),
    parse,
    validate : require("./apn/credentials/validate"),
    logger   : debug
});

const config = require("./apn/config")({
    debug,
    prepareCredentials
});

const tls = require("tls");

const framer = require("./apn/protocol/framer");
const compressor = require("./apn/protocol/compressor");

const protocol = {
    Serializer   : framer.Serializer,
    Deserializer : framer.Deserializer,
    Compressor   : compressor.Compressor,
    Decompressor : compressor.Decompressor,
    Connection   : require("./apn/protocol/connection").Connection,
};

const Endpoint = require("./apn/protocol/endpoint")({
    tls,
    protocol
});

const EndpointManager = require("./apn/protocol/endpointManager")({
    Endpoint
});

const Connection = require("./apn/connection")({
    config,
    EndpointManager
});

const Notification = require("./apn/notification");

const Device = require("./apn/device");

module.exports = {
    Connection,
    Notification,
    Device
};