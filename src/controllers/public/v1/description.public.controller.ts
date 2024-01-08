import { Request, Response, NextFunction } from "express";
import {Configuration} from "../../../utils/types/configuration";
import {getAppKey, getConfigFile, getEndpoint, getServiceKey} from "../../../libs/loaders/configuration";
import {restfulResponse} from "../../../libs/api/RESTfulResponse";
import {Catalog} from "../../../utils/types/catalog";
import {version} from './../../../../package.json';

export const getSelfDescription = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const config = getConfigFile();

        const configuration = await Configuration.findOne(config).lean();

        const catalog = await Catalog.find({enabled: true}).select('-enabled').lean();

        const selfDescription = {
            "@context" : {
                "ptx" : "https://w3id.org/ptxa/core/",
                "ptxc" : "https://w3id.org/ptxa/code/"
            },
            "@type" : "ptx:BaseConnector",
            "@id" : "https://w3id.org/ptx/",
            "ptx:version" : version,
            "ptx:description" : [ {
                "@value" : "Prometheus Connector reference implementation",
                "@type" : "http://www.w3.org/2001/XMLSchema#string"
            } ],
            "ptx:serviceKey" : {
                "@type" : "ptx:ServiceKey",
                "@id" : "https://w3id.org/ptx/",
                "ptx:keyType" : {
                    "@id" : "https://w3id.org/ptxa/code/RSA"
                },
                "ptx:keyValue" : await getServiceKey()
            },
            "ptx:title" : [ {
                "@value" : "Dataspace Connector",
                "@type" : "http://www.w3.org/"
            } ],
            "ptx:appKey" : {
                "@type" : "ptx:AppKey",
                "@id" : "https://w3id.org/ptx/",
                "ptx:keyType" : {
                    "@id" : "https://w3id.org/ptxa/code/RSA"
                },
                "ptx:keyValue" : await getAppKey()
            },
            "ptx:hasDefaultEndpoint" : {
                "@type" : "ptx:ConnectorEndpoint",
                "@id" : "https://w3id.org/ptx/",
                "ptx:accessURL" : {
                    "@id" : await getEndpoint()
                }
            },
            // @ts-ignore
            "ptx:catalog": [],
            "ptx:securityProfile" : {
                "@id" : "https://w3id.org/ptx/"
            },
            "ptx:maintainer" : {
                "@id" : process.env.MAINTAINER
            },
            "ptx:curator" : {
                "@id" : process.env.CURATOR
            },
            "ptx:ModelVersion" : "2.6.0"
        }

        if(catalog.length > 0){
            const cat: { "@type": string; "@id": string; }[] = [];

            catalog.forEach(c => {
                cat.push({
                    "@type": `ptx:${c.type}`,
                    "@id": c.endpoint
                })
            })

            selfDescription['ptx:catalog'] = cat
        }

        return restfulResponse(res, 200, selfDescription)
    } catch (err) {
        next(err);
    }
};
