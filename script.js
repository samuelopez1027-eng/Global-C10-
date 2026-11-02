
// ============================================
// 1. PRELOADED DECISION PROBLEMS
// ============================================

const examples = {

    example1: {
        name: "Investment",
        alternatives: ["Investment A", "Investment B", "Investment C"],
        states: ["High Demand", "Medium Demand", "Low Demand"],
        payoffs: [
            [120, 70, 20],
            [90, 85, 40],
            [60, 80, 70]
        ],
        probabilities: [0.3, 0.5, 0.2]
    },

    example2: {
        name: "Production",
        alternatives: ["Factory A", "Factory B", "Factory C", "Factory D"],
        states: ["High Demand", "Normal Demand", "Low Demand"],
        payoffs: [
            [200, 100, -40],
            [150, 120, 60],
            [100, 110, 90],
            [80, 100, 95]
        ],
        probabilities: [0.25, 0.5, 0.25]
    }
};


// ============================================
// 2. CURRENT DECISION DATA
// ============================================

let alternatives = [];
let states = [];
let payoffs = [];
let probabilities = [];

const tolerance = 0.000001;

const $ = id => document.getElementById(id);

function loadData(data) {

    alternatives = [...data.alternatives];
    states = [...data.states];

    payoffs = data.payoffs.map(row => [...row]);

    probabilities = [...data.probabilities];

    renderAll();
}


// ============================================
// 3. INPUT TABLES
// ============================================

function renderPayoffTable() {

    const head = $("payoffTable").querySelector("thead");
    const body = $("payoffTable").querySelector("tbody");

    head.innerHTML = "";
    body.innerHTML = "";

    const header = document.createElement("tr");

    const firstHeader = document.createElement("th");
    firstHeader.textContent = "Alternative";
    header.appendChild(firstHeader);

    states.forEach((state, j) => {

        const th = document.createElement("th");

        const input = document.createElement("input");
        input.className = "cell-input name-input";
        input.value = state;
        input.setAttribute("aria-label", `State ${j + 1} name`);

        input.addEventListener("change", () => {
            states[j] = input.value.trim() || `State ${j + 1}`;
            renderAll();
        });

        th.appendChild(input);
        header.appendChild(th);
    });

    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Action";
    header.appendChild(actionHeader);

    head.appendChild(header);

    alternatives.forEach((alternative, i) => {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");
        const nameInput = document.createElement("input");

        nameInput.className = "cell-input name-input";
        nameInput.value = alternative;
        nameInput.setAttribute("aria-label", `Alternative ${i + 1} name`);

        nameInput.addEventListener("change", () => {
            alternatives[i] = nameInput.value.trim() || `Alternative ${i + 1}`;
            renderAll();
        });

        nameCell.appendChild(nameInput);
        tr.appendChild(nameCell);

        states.forEach((state, j) => {

            const td = document.createElement("td");
            const input = document.createElement("input");

            input.type = "number";
            input.step = "any";
            input.className = "cell-input";
            input.value = payoffs[i][j];

            input.setAttribute(
                "aria-label",
                `${alternative}, ${state} payoff`
            );

            input.addEventListener("input", () => {

                payoffs[i][j] = input.value.trim() === ""
                    ? null
                    : Number(input.value);

                updateResults();
            });

            td.appendChild(input);
            tr.appendChild(td);
        });

        const actionCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.className = "btn btn-danger";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {

            if (alternatives.length <= 1) {
                alert("At least one alternative is required.");
                return;
            }

            alternatives.splice(i, 1);
            payoffs.splice(i, 1);

            renderAll();
        });

        actionCell.appendChild(removeButton);
        tr.appendChild(actionCell);

        body.appendChild(tr);
    });
}


function renderProbabilityTable() {

    const head = $("probabilityTable").querySelector("thead");
    const body = $("probabilityTable").querySelector("tbody");

    head.innerHTML = "";
    body.innerHTML = "";

    const header = document.createElement("tr");

    const stateHeader = document.createElement("th");
    stateHeader.textContent = "State of Nature";
    header.appendChild(stateHeader);

    const probabilityHeader = document.createElement("th");
    probabilityHeader.textContent = "Probability";
    header.appendChild(probabilityHeader);

    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Action";
    header.appendChild(actionHeader);

    head.appendChild(header);

    states.forEach((state, j) => {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = state;
        tr.appendChild(nameCell);

        const probabilityCell = document.createElement("td");
        const input = document.createElement("input");

        input.type = "number";
        input.step = "any";
        input.min = "0";
        input.max = "1";
        input.className = "cell-input";
        input.value = probabilities[j];

        input.setAttribute("aria-label", `${state} probability`);

        input.addEventListener("input", () => {

            probabilities[j] = input.value.trim() === ""
                ? null
                : Number(input.value);

            updateResults();
        });

        probabilityCell.appendChild(input);
        tr.appendChild(probabilityCell);

        const actionCell = document.createElement("td");
        const removeButton = document.createElement("button");

        removeButton.className = "btn btn-danger";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {

            if (states.length <= 1) {
                alert("At least one state is required.");
                return;
            }

            states.splice(j, 1);
            probabilities.splice(j, 1);

            payoffs.forEach(row => row.splice(j, 1));

            renderAll();
        });

        actionCell.appendChild(removeButton);
        tr.appendChild(actionCell);

        body.appendChild(tr);
    });
}


// ============================================
// 4. DATA VALIDATION
// ============================================

function validateData() {

    const message = $("validationMessage");

    if (alternatives.length === 0 || states.length === 0) {
        message.textContent = "At least one alternative and one state are required.";
        message.className = "validation error";
        return false;
    }

    if (alternatives.some(name => !name.trim()) ||
        states.some(name => !name.trim())) {

        message.textContent = "All alternatives and states need names.";
        message.className = "validation error";
        return false;
    }

    const flatPayoffs = payoffs.flat();

    if (flatPayoffs.some(value =>
        value === null ||
        !Number.isFinite(value)
    )) {

        message.textContent = "Please enter a valid number in every payoff cell.";
        message.className = "validation error";
        return false;
    }

    if (probabilities.some(p =>
        p === null ||
        !Number.isFinite(p) ||
        p < 0 ||
        p > 1
    )) {

        message.textContent = "Probabilities must be between 0 and 1.";
        message.className = "validation error";
        return false;
    }

    const total = probabilities.reduce((sum, p) => sum + p, 0);

    if (Math.abs(total - 1) > tolerance) {

        message.textContent =
            `Probabilities must add up to 1. Current total: ${total.toFixed(3)}`;

        message.className = "validation error";
        return false;
    }

    message.textContent = "✓ All inputs are valid. Total probability = 1.";
    message.className = "validation success";

    return true;
}


// ============================================
// 5. DECISION CRITERIA CALCULATIONS
// ============================================

function calculateResults() {

    const maxima = payoffs.map(row => Math.max(...row));

    const minima = payoffs.map(row => Math.min(...row));

    // Maximax: highest maximum payoff

    const maximaxBest = Math.max(...maxima);

    const maximaxWinners = maxima
        .map((value, i) => ({ value, i }))
        .filter(item => Math.abs(item.value - maximaxBest) < tolerance)
        .map(item => item.i);


    // Maximin: highest minimum payoff

    const maximinBest = Math.max(...minima);

    const maximinWinners = minima
        .map((value, i) => ({ value, i }))
        .filter(item => Math.abs(item.value - maximinBest) < tolerance)
        .map(item => item.i);


    // Regret Matrix

    const bestByState = states.map((state, j) =>
        Math.max(...payoffs.map(row => row[j]))
    );

    const regrets = payoffs.map(row =>
        row.map((value, j) => bestByState[j] - value)
    );

    const maximumRegrets = regrets.map(row => Math.max(...row));

    // Minimax Regret: lowest maximum regret

    const minimaxBest = Math.min(...maximumRegrets);

    const minimaxWinners = maximumRegrets
        .map((value, i) => ({ value, i }))
        .filter(item => Math.abs(item.value - minimaxBest) < tolerance)
        .map(item => item.i);


    // EMV: sum of payoff * probability

    const emvs = payoffs.map(row =>
        row.reduce(
            (sum, value, j) => sum + value * probabilities[j],
            0
        )
    );

    const emvBest = Math.max(...emvs);

    const emvWinners = emvs
        .map((value, i) => ({ value, i }))
        .filter(item => Math.abs(item.value - emvBest) < tolerance)
        .map(item => item.i);


    return {
        maxima,
        minima,
        regrets,
        maximumRegrets,
        emvs,

        maximaxBest,
        maximinBest,
        minimaxBest,
        emvBest,

        maximaxWinners,
        maximinWinners,
        minimaxWinners,
        emvWinners
    };
}


// ============================================
// 6. DISPLAY RESULTS
// ============================================

function formatNumber(number) {
    return Number(number.toFixed(2)).toString();
}

function winnerNames(indices) {
    return indices.map(i => alternatives[i]).join(", ");
}

function showCriterion(valueId, winnerId, value, winners) {

    $(valueId).textContent = formatNumber(value);

    $(""+winnerId).textContent =
        "Recommended: " + winnerNames(winners);
}


function renderResults(result) {

    showCriterion(
        "maximaxValue",
        "maximaxWinner",
        result.maximaxBest,
        result.maximaxWinners
    );

    showCriterion(
        "maximinValue",
        "maximinWinner",
        result.maximinBest,
        result.maximinWinners
    );

    showCriterion(
        "regretValue",
        "regretWinner",
        result.minimaxBest,
        result.minimaxWinners
    );

    showCriterion(
        "emvValue",
        "emvWinner",
        result.emvBest,
        result.emvWinners
    );


    // Detailed results table

    const body = $("resultsTable").querySelector("tbody");
    body.innerHTML = "";

    alternatives.forEach((name, i) => {

        const tr = document.createElement("tr");

        const values = [
            name,
            formatNumber(result.maxima[i]),
            formatNumber(result.minima[i]),
            formatNumber(result.maximumRegrets[i]),
            formatNumber(result.emvs[i])
        ];

        values.forEach(value => {

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });


    // Regret table

    const head = $("regretTable").querySelector("thead");
    const regretBody = $("regretTable").querySelector("tbody");

    head.innerHTML = "";
    regretBody.innerHTML = "";

    const header = document.createElement("tr");

    ["Alternative", ...states, "Maximum Regret"].forEach(name => {

        const th = document.createElement("th");
        th.textContent = name;
        header.appendChild(th);
    });

    head.appendChild(header);

    alternatives.forEach((name, i) => {

        const tr = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = name;
        tr.appendChild(nameCell);

        result.regrets[i].forEach(value => {

            const td = document.createElement("td");
            td.textContent = formatNumber(value);
            tr.appendChild(td);
        });

        const maxCell = document.createElement("td");
        maxCell.textContent = formatNumber(result.maximumRegrets[i]);
        tr.appendChild(maxCell);

        regretBody.appendChild(tr);
    });
}


// ============================================
// 7. STAGED FILTERING
// ============================================

const criterionInfo = {
    maximax: {
        name: "Maximax",
        type: "max",
        values: result => result.maxima
    },

    maximin: {
        name: "Maximin",
        type: "max",
        values: result => result.minima
    },

    regret: {
        name: "Minimax Regret",
        type: "min",
        values: result => result.maximumRegrets
    },

    emv: {
        name: "EMV / Bayes",
        type: "max",
        values: result => result.emvs
    }
};


function runFiltering(result) {

    const settings = [
        $("filter1").value,
        $("filter2").value,
        $("filter3").value,
        $("filter4").value
    ];

    let survivors = alternatives.map((name, i) => i);

    const steps = [];
    const initial = [...survivors];

    settings.forEach((criterion, index) => {

        if (survivors.length <= 1) return;

        const info = criterionInfo[criterion];

        const values = info.values(result);

        const currentValues = survivors.map(i => values[i]);

        const best = info.type === "max"
            ? Math.max(...currentValues)
            : Math.min(...currentValues);

        const previous = [...survivors];

        survivors = survivors.filter(i =>
            Math.abs(values[i] - best) < tolerance
        );

        const eliminated = previous.filter(i => !survivors.includes(i));

        steps.push({
            stage: index + 1,
            criterion: info.name,
            survivors: [...survivors],
            eliminated,
            best
        });

    });

    return {
        initial,
        steps,
        survivors
    };
}


// ============================================
// 8. DISPLAY FILTERING STEPS
// ============================================

function renderFiltering(result) {

    const filtering = runFiltering(result);

    const container = $("filterSteps");
    container.innerHTML = "";

    const flow = $("flowDiagram");
    flow.innerHTML = "";

    function addFlowNode(title, names, final = false) {

        const node = document.createElement("div");

        node.className = final
            ? "flow-node final"
            : "flow-node";

        node.textContent = `${title}: ${names}`;

        flow.appendChild(node);

        const arrow = document.createElement("div");
        arrow.className = "flow-arrow";
        arrow.textContent = "↓";

        flow.appendChild(arrow);
    }

    addFlowNode(
        "Initial alternatives",
        filtering.initial.map(i => alternatives[i]).join(", ")
    );

    filtering.steps.forEach(step => {

        const card = document.createElement("article");
        card.className = "filter-step";

        const title = document.createElement("h4");
        title.textContent = `Stage ${step.stage}: ${step.criterion}`;

        const survivorsText = document.createElement("p");
        survivorsText.className = "survivors";
        survivorsText.textContent =
            "Survivors: " +
            step.survivors.map(i => alternatives[i]).join(", ");

        const eliminatedText = document.createElement("p");
        eliminatedText.className = "eliminated";

        eliminatedText.textContent =
            step.eliminated.length > 0
                ? "Eliminated: " +
                  step.eliminated.map(i => alternatives[i]).join(", ")
                : "Eliminated: None (tie or all alternatives remain)";

        const valueText = document.createElement("p");
        valueText.textContent =
            "Best criterion value: " + formatNumber(step.best);

        card.append(title, survivorsText, eliminatedText, valueText);
        container.appendChild(card);

        addFlowNode(
            `After Stage ${step.stage}`,
            step.survivors.map(i => alternatives[i]).join(", ")
        );
    });

    const finalNames = filtering.survivors.map(i => alternatives[i]);

    const finalNode = document.createElement("div");
    finalNode.className = "flow-node final";

    finalNode.textContent = finalNames.length > 0
        ? "Final outcome: " + finalNames.join(", ")
        : "No final alternative";

    flow.appendChild(finalNode);

    const conclusion = $("filterConclusion");

    if (finalNames.length === 0) {

        conclusion.textContent =
            "No final alternative was found.";

    } else if (finalNames.length === 1) {

        conclusion.textContent =
            "Final recommended alternative: " + finalNames[0];

    } else {

        conclusion.textContent =
            "Multiple alternatives remain because of ties: " +
            finalNames.join(", ");
    }

    if (filtering.steps.length === 0) {

        conclusion.textContent =
            "Filtering stopped because only one alternative was available.";
    }
}


// ============================================
// 9. AUTOMATIC UPDATE
// ============================================

function updateResults() {

    if (!validateData()) {

        [
            "maximaxValue",
            "maximinValue",
            "regretValue",
            "emvValue"
        ].forEach(id => $(id).textContent = "-");

        [
            "maximaxWinner",
            "maximinWinner",
            "regretWinner",
            "emvWinner"
        ].forEach(id => $(id).textContent = "Invalid input");

        $("resultsTable").querySelector("tbody").innerHTML = "";
        $("regretTable").querySelector("thead").innerHTML = "";
        $("regretTable").querySelector("tbody").innerHTML = "";
        $("filterSteps").innerHTML = "";
        $("flowDiagram").innerHTML = "";
        $("filterConclusion").textContent =
            "Correct the inputs to calculate the decision model.";

        return;
    }

    const result = calculateResults();

    renderResults(result);
    renderFiltering(result);
}


function renderAll() {

    renderPayoffTable();
    renderProbabilityTable();
    updateResults();
}


// ============================================
// 10. ADD AND REMOVE DATA
// ============================================

$("addAlternative").addEventListener("click", () => {

    const newName = `Alternative ${alternatives.length + 1}`;

    alternatives.push(newName);

    payoffs.push(states.map(() => 0));

    renderAll();
});


$("addState").addEventListener("click", () => {

    const newName = `State ${states.length + 1}`;

    states.push(newName);

    payoffs.forEach(row => row.push(0));

    // Give the new state a valid probability distribution.
    const newProbability = 1 / states.length;

    probabilities = states.map(() => newProbability);

    renderAll();
});


// ============================================
// 11. LOAD PRELOADED EXAMPLES
// ============================================

$("loadExample").addEventListener("click", () => {

    const selected = $("exampleSelect").value;

    if (selected === "custom") {

        loadData({
            alternatives: ["Alternative 1", "Alternative 2"],
            states: ["State 1", "State 2"],
            payoffs: [[100, 50], [60, 90]],
            probabilities: [0.5, 0.5]
        });

        return;
    }

    loadData(examples[selected]);
});


// ============================================
// 12. UPDATE FILTERS AUTOMATICALLY
// ============================================

["filter1", "filter2", "filter3", "filter4"].forEach(id => {

    $(id).addEventListener("change", updateResults);

});


// ============================================
// 13. START DASHBOARD
// ============================================

loadData({
    alternatives: ["Alternative 1", "Alternative 2", "Alternative 3"],
    states: ["State 1", "State 2"],
    payoffs: [
        [100, 50],
        [70, 90],
        [40, 120]
    ],
    probabilities: [0.5, 0.5]
});
