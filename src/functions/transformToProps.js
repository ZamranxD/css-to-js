import prettier from "prettier/standalone";
import prettierBabylon from "prettier/parser-babylon";

function formatProps(propString) {
  // Write the props in a component so Prettier knows how to format it
  let componentString = `<Temp ${propString} />`;

  componentString = prettier.format(componentString, {
    parser: "babel",
    plugins: [prettierBabylon]
  });

  // Return the Prettier output but without the component tag
  let groups = componentString.match(/<Temp(.*)\/>/s);
  if (groups.length < 2) {
    throw new Error("Something went wrong when parsing Prettier output");
  }
  return groups[1]
    .trim()
    .split("\n")
    .map(line => line.trim())
    .join("\n");
}

/**
 * Transforms a JS object to React props.
 * @param {string} code
 * @returns {string} transformed code
 */
export const transform = code => {
  // Parse the code as a JS object
  let rules;
  try {
    // eslint-disable-next-line no-new-func
    rules = new Function(`return ${code}`)();
  } catch (e) {
    return "Could not parse input";
  }

  // Convert JS object to array of strings
  const propStrings = Object.keys(rules).map(key => {
    let value = rules[key];

    if (typeof value === "string") {
      value = `"${value}"`;
    } else {
      value = `{${JSON.stringify(value)}}`;
    }

    return `${key}=${value}`;
  });

  return formatProps(propStrings.join(" "));
};

if (typeof window === "undefined") {
  exports.handler = function({ body }, context, callback) {
    callback(null, {
      statusCode: 200,
      body: transform(body)
    });
  };
}
