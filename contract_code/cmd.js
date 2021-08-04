const child_process = require('child_process');
const util = require('util');

const exec = util.promisify(child_process.exec);


const exec_solc = async function (filename) {
  const result = await exec(`./solppc --bin  --abi ${filename} > result.raw`);
  if (result.stderr) {
    throw new Error(`Check failed! err: ${result.stderr}`);
  }
}

const contract_compiled_code_hex = async function () {
  const result = await exec(`cat result.raw | grep -v "OffChain Binary" | grep Binary -A1 | grep -v "Binary"`);
  // console.log(result.stdout.trim());
  if (result.stderr) {
    throw new Error(`Check failed! err: ${result.stderr}`);
  }
  return result.stdout.trim();
}

const contract_compiled_abi = async function () {
  const result = await exec(`cat result.raw | grep -v "OffChain Binary"  | grep "Contract JSON ABI" -A1 | grep -v "Contract JSON ABI"`);
  if (result.stderr) {
    throw new Error(`Check failed! err: ${result.stderr}`);
  }
  return result.stdout.trim();
}


const download_solc = async function (metapath) {
  try {
    const solpccVersion = await exec(`./solppc --version`);
    if (!solpccVersion.stderr) {
      return
    }
  } catch (err) {
    console.log(err);
  }

  console.log(metapath);
  const meta = await exec(`cat ${metapath}`);
  if (meta.stderr) {
    console.log(meta.stderr);
    throw new Error(`Check failed! err: ${meta.stderr}`);
  }
  const meta_info = JSON.parse(meta.stdout);
  await exec(`wget -c https://github.com/vitelabs/soliditypp-bin/releases/download/${meta_info.version}/solppc_linux.tar.gz && tar xvf solppc_linux.tar.gz`);

  const result = await exec(`./solppc --version`);
  if (result.stderr) {
    console.log(result.stderr);
    throw new Error(`Check failed! err: ${result.stderr}`);
  }
  console.log(result.stdout)
}

const compile_solc = async function (filename) {
  await exec_solc(filename);
  const code = await contract_compiled_code_hex();
  console.log(code);
  const abi = await contract_compiled_abi();
  console.log(abi);

  return { code: code, abi: abi };
}

module.exports = {
  compile_solc: compile_solc,
  download_solc: download_solc
}
