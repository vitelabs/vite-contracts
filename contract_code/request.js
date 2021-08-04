
const { HTTP_RPC } = require('@vite/vitejs-http');

const { ViteAPI } = require('@vite/vitejs');

const node_api = 'https://node.vite.net/gvite/http';


const api = new ViteAPI(new HTTP_RPC(`${node_api}`));

height = async () => {
  const height = await api.request(
    'ledger_getSnapshotChainHeight'
  );
  console.log(height);
  return height;
}

const contract_create_code = async (address) => {
  const block = await api.request('ledger_getAccountBlockByHeight', address, 1);

  const sendBlock = await api.request('ledger_getAccountBlockByHash', block.sendBlockHash);

  return Buffer.from(sendBlock.data, 'base64').toString('hex');
}


const compare_code = async (create_code_hex, compiled_code_hex) => {
  console.log('chained code', create_code_hex);
  console.log('compiled code', compiled_code_hex)
  const code_buff = Buffer.from(create_code_hex, 'hex');
  const compiled_code_buff = Buffer.from(compiled_code_hex, 'hex');

  const len1 = 10 + 1 + 1;
  const len2 = 10 + 1 + 1 + 1 + 1;

  const postfixLen = 32 + 2;
  const indexOf = code_buff.indexOf(compiled_code_buff.slice(0, compiled_code_buff.length - postfixLen));
  return (indexOf === len1 || indexOf === len2);
}



module.exports = {
  contract_create_code: contract_create_code,
  compare_code: compare_code,
}
