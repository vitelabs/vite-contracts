const { compile_solc, download_solc } = require('./cmd');
const { contract_create_code, compare_code } = require('./request');
const fs = require('fs');
const core = require('@actions/core');


console.log(process.env.git_added);
console.log(process.env.git_modified);
console.log(process.env.git_removed);
console.log(process.env.git_renamed);

added = JSON.parse(process.env.git_added);
modified = JSON.parse(process.env.git_modified);
removed = JSON.parse(process.env.git_removed);
renamed = JSON.parse(process.env.git_renamed);

// args.forEach((val, index) => {
//   console.log(`${val}`)
// });

check_file = async () => {
  if (modified.length > 0 || removed.length > 0 || renamed.length > 0) {
    throw new Error('Check failed!');
  }

  if (added.length === 0) {
    throw new Error('Check failed!');
  }

  const dirDepth = 2;
  let dirname = '';
  added.forEach((val) => {
    const files = val.split('/')
    if (files.length != dirDepth) {
      console.log(`invalid file ${val}`);
      throw new Error('Check failed!');
    }
    [dir, file] = files;
    if (!dirname) {
      dirname = dir;
    }
    if (dirname && dir != dirname) {
      console.log(`only one address can be added at a time. ${dir}<->${dirname}`);
      throw new Error('Check failed!');
    }
  });
  return dirname;
}

const write_abi_json = async (filename, content) => {
  fs.writeFile(filename, content, function (error) {
    console.log('write result, ', error);
  });
}


verify_contract_code = async () => {
  const address = await check_file();
  console.log("address", address);
  if (!address) throw new Error('Error address');

  await download_solc(`${address}/meta`);
  const compiled_result = await compile_solc(`${address}/source.solpp`)
  const code_hex = await contract_create_code(address);
  const result = await compare_code(code_hex, compiled_result.code);
  if (!result) {
    console.log(`code compare filed`);
    throw new Error('Check failed!')
  }
  await write_abi_json(`${address}/abi.json`, compiled_result.abi);
  // if (!compiled_result.code || compiled_result.code != code_hex) {
  //   console.log('verification failed');
  //   console.log(compiled_result.code);
  //   console.log(code_hex);
  //   throw new Error('Check failed!');
  // }
  console.log(address);
  core.setOutput('address', address);
}





module.exports = {
  name: 'Contract-Verify',
  callback: verify_contract_code,
}

