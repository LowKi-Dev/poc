// proof_of_concept.js

const ejs = require('ejs');

// Sample IDL JSON
const idl = {
  "version": "0.0.0",
  "name": "ticket_bounty",
  "instructions": [
    {
      "name": "createBounty",
      "accounts": [
        { "name": "bounty", "isMut": true, "isSigner": true },
        { "name": "creator", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "description", "type": "string" },
        { "name": "reward", "type": "u64" }
      ]
    }
    // ... Other instructions can be added here
  ]
};

// Sample EJS Template
const template = `
import React from 'react';
import { useForm } from 'react-hook-form';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import idl from './idl.json';
import { Button, TextField } from '@material-ui/core';

const <%= componentName %> = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    const provider = Provider.local();
    const program = new Program(idl as any, idl.metadata.address, provider);

    try {
      await program.rpc.<%= instruction.name %>(<%= args %>, {
        accounts: {
          <%- accounts %>
        },
        signers: []
      });
      alert('<%= instruction.name %> executed successfully!');
    } catch (err) {
      console.error(err);
      alert('Error executing <%= instruction.name %>');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <% instruction.args.forEach(arg => { %>
        <TextField label="<%= arg.name %>" {...register('<%= arg.name %>', { required: true })} fullWidth />
      <% }) %>
      <Button type="submit" variant="contained" color="primary">
        <%= instruction.name %>
      </Button>
    </form>
  );
};

export default <%= componentName %>;
`;

// Parse Function
function generateComponent(idl, instructionName) {
  const instruction = idl.instructions.find(instr => instr.name === instructionName);
  if (!instruction) {
    console.error('Instruction not found in IDL.');
    return;
  }

  const componentName = instruction.name.charAt(0).toUpperCase() + instruction.name.slice(1) + 'Form';

  const args = instruction.args.map(arg => `data.${arg.name}`).join(', ');

  const accounts = instruction.accounts.map(acc => {
    return `${acc.name}: ${acc.isSigner ? 'provider.wallet.publicKey' : `new PublicKey(data.${acc.name})`},`;
  }).join('\n          ');

  const rendered = ejs.render(template, {
    instruction,
    componentName,
    args,
    accounts
  });

  console.log(rendered);
}

// Generate and log the component
generateComponent(idl, 'createBounty');