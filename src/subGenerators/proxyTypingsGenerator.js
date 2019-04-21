const camelCase = require("camelcase");
const { ServiceDescriptorProto } = require("google-protobuf/google/protobuf/descriptor_pb");

const ImportsCatalog = require("../importsCatalog");
const StringBuilder = require("../stringBuilder");
const requiresGenerator = require("./requiresGenerator");

/**
 * @param {StringBuilder} builder String builder
 * @param {ServiceDescriptorProto} serviceDescriptor Service descriptor
 * @param {ImportsCatalog} importsCatalog Imports catalog
 */
const generate = (builder, serviceDescriptor, importsCatalog) => {
  builder
    .appendLineIdented(`export class ${serviceDescriptor.getName()}Client {`)
    .appendLineIdented("constructor(address: string, credentials: ChannelCredentials);", 1);

  serviceDescriptor.getMethodList().forEach(method => {
    const methodName = camelCase(method.getName());
    const inputMessage = importsCatalog.getMessage(method.getInputType());
    const inputTypeName = requiresGenerator.getNamespace(inputMessage.fileName) + inputMessage.name;
    const outputMessage = importsCatalog.getMessage(method.getOutputType());
    const outputTypeName = requiresGenerator.getNamespace(outputMessage.fileName) + outputMessage.name;

    if (method.getClientStreaming() === true && method.getServerStreaming() === true)
      builder.appendLineIdented(
        `${methodName}(message: Iterable<${inputTypeName}>): AsyncIterableIterator<${outputTypeName}>;`,
        1
      );
    else if (method.getClientStreaming() === true)
      builder.appendLineIdented(`${methodName}(message: Iterable<${inputTypeName}>): Promise<${outputTypeName}>;`, 1);
    else if (method.getServerStreaming() === true)
      builder.appendLineIdented(`${methodName}(message: ${inputTypeName}): Promise<Array<${outputTypeName}>>;`, 1);
    else builder.appendLineIdented(`${methodName}(message: ${inputTypeName}): Promise<${outputTypeName}>;`, 1);
  });

  builder.appendLineIdented("}");
};

module.exports = { generate };
